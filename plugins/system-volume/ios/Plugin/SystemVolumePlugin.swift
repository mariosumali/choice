import Foundation
import AVFoundation
import MediaPlayer
import UIKit
import Capacitor

@objc(SystemVolumePlugin)
public class SystemVolumePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SystemVolumePlugin"
    public let jsName = "SystemVolume"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getSystemVolume", returnType: CAPPluginReturnPromise)
    ]

    private let session = AVAudioSession.sharedInstance()

    // AVAudioSession.outputVolume is unreliable on a fresh iPhone launch when
    // the session is .ambient with no audio playing — it can return 0.0 or
    // stale values until the session is "warmed up". An offscreen MPVolumeView
    // exposes a UISlider whose value reflects the real system media volume in
    // real time, so we use it as the primary source and fall back to
    // outputVolume only when the slider isn't attached yet.
    private var volumeView: MPVolumeView?
    private weak var volumeSlider: UISlider?

    override public func load() {
        do {
            try session.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            try session.setActive(true, options: [])
        } catch {
            CAPLog.print("[SystemVolume] Failed to activate AVAudioSession: \(error)")
        }

        DispatchQueue.main.async { [weak self] in
            self?.attachVolumeView()
        }
    }

    private func attachVolumeView() {
        guard volumeView == nil else { return }

        // Park the view far offscreen and make it invisible — it must be in
        // the hierarchy for the embedded slider to track system volume, but
        // we never want the user to see it.
        let view = MPVolumeView(frame: CGRect(x: -4000, y: -4000, width: 10, height: 10))
        view.showsRouteButton = false
        view.isUserInteractionEnabled = false
        view.alpha = 0.01

        guard let rootView = bridge?.viewController?.view else {
            // Retry once on the next runloop tick — on cold start the Capacitor
            // view controller may not be mounted yet.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { [weak self] in
                self?.attachVolumeView()
            }
            return
        }

        rootView.addSubview(view)
        view.setNeedsLayout()
        view.layoutIfNeeded()
        volumeView = view
        cacheVolumeSlider(in: view)

        if volumeSlider == nil {
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self, weak view] in
                guard let view = view else { return }
                self?.cacheVolumeSlider(in: view)
            }
        }
    }

    private func cacheVolumeSlider(in view: MPVolumeView) {
        for subview in view.subviews {
            if let slider = subview as? UISlider {
                volumeSlider = slider
                break
            }
        }
    }

    private func currentLevel() -> Float {
        if let value = volumeSlider?.value, value.isFinite, value >= 0 {
            return min(max(value, 0.0), 1.0)
        }
        return min(max(session.outputVolume, 0.0), 1.0)
    }

    @objc func getSystemVolume(_ call: CAPPluginCall) {
        DispatchQueue.main.async { [weak self] in
            guard let self = self else {
                call.reject("Plugin deallocated")
                return
            }

            if self.volumeView == nil {
                self.attachVolumeView()
            }

            // iOS can silently deactivate an .ambient session that has no
            // audio flowing. Re-activate before reading so outputVolume is
            // current if we need to fall back to it.
            try? self.session.setActive(true, options: [])

            let level = self.currentLevel()
            let notches = Int((Double(level) * 16.0).rounded())
            let muted = level < 0.001

            call.resolve([
                "level": level,
                "notches": notches,
                "muted": muted
            ])
        }
    }
}
