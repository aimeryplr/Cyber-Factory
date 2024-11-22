/**
 * musics, sfx and ambient: volume [0, 100]
 */
export interface settingsData {
    musics: number,
    sfx: number,
}

export class Settings {
    private static instance: Settings;
    private parameters: settingsData
    private callbacks = new Array<(parameters: settingsData) => void>()


    private constructor() {
        this.parameters = {
            musics: 100,
            sfx: 100
        }
    }

    // Method to access the singleton instance
    public static getInstance(): Settings {
        if (!this.instance) {
            this.instance = new Settings();
        }
        return this.instance;
    }

    setSettings(newParameters: settingsData) {
        for (const callback of this.callbacks) callback(newParameters);
        this.parameters = newParameters
    }

    getSettings(): settingsData {
        return this.parameters
    }

    addCallbackOnNewParameters(callback: (oldParameters: settingsData) => void) {
        this.callbacks.push(callback)
    }
}