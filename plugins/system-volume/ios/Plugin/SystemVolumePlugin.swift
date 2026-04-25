import Foundation
import AVFoundation
import Capacitor

@objc(SystemVolumePlugin)
public class SystemVolumePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SystemVolumePlugin"
    public let jsName = "SystemVolume"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getSystemVolume", returnType: CAPPluginReturnPromise)
    ]

    private let session = AVAudioSession.sharedInstance()

    override public func load() {
        do {
            try session.setCategory(.ambient, mode: .default, options: [.mixWithOthers])
            try session.setActive(true, options: [])
        } catch {
            CAPLog.print("[SystemVolume] Failed to activate AVAudioSession: \(error)")
        }
    }

    @objc func getSystemVolume(_ call: CAPPluginCall) {
        let level = session.outputVolume
        let notches = Int((Double(level) * 16.0).rounded())
        let muted = level < 0.001

        call.resolve([
            "level": level,
            "notches": notches,
            "muted": muted
        ])
    }
}
