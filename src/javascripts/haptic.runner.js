export const HapticRunner = {
    run: (type = "light") => {
        try {
            Haptic.postMessage(type);
        } catch {
            console.log("error: haptic-runner");
        }
    },
};
