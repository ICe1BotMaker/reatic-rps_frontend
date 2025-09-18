export const FilePickerRunner = {
    run: async (key, ref) => {
        try {
            const method = `run${key
                .split(".")
                .map((x) =>
                    [...x]
                        .map((_, i) => (i === 0 ? _.toUpperCase() : _))
                        .join("")
                )
                .join("")}`;

            FilePicker.postMessage(method);
        } catch {
            console.log("error: filepicker-runner");
            if (ref?.current) ref.current.click();
        }
    },
};
