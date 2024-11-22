import { Players, ReplicatedStorage, Workspace } from "@rbxts/services";
import { settingsData, Settings } from "ReplicatedStorage/settings";

const parameters = Settings.getInstance();
parameters.addCallbackOnNewParameters((newParameters: settingsData) => {changeSoundsVolumes(newParameters)});

export function getSoundEffect(soundName: string): Sound {
    const sound = ReplicatedStorage.WaitForChild("Sounds").WaitForChild("SFX").WaitForChild(soundName) as Sound;
    if (!sound) error(`Sound ${soundName} not found`);

    return sound;
}

/**
 * Duplicate the sound to not have to wait for it to finish playing
 * @param soundName The name of the sound to play
 */
export function playSoundEffectDuplicated(sound: Sound): Sound {
    const newSound = sound.Clone();
    newSound.Parent = sound.Parent;
    newSound.Play();

    newSound.Ended.Connect(() => {
        newSound.Destroy();
    });

    return newSound;
}

export function playSoundEffectAtRandomTime(sound: Sound) {
    sound.TimePosition = math.random(0, sound.TimeLength);
    sound.Play();
}

export function setRandomPitch(sound: Sound, min: number, max: number) {
    const pitch = sound.FindFirstChild("PitchShiftSoundEffect") ? sound.FindFirstChild("PitchShiftSoundEffect") as PitchShiftSoundEffect : new Instance("PitchShiftSoundEffect", sound);
    const rand = math.random(min * 100, max * 100) / 100;
    pitch.Octave = rand
}

export function playSoundEffectWithoutStopping(sound: Sound) {
    if (sound.Playing) return;

    sound.Play();
}


function changeSoundsVolumes(newParameters: settingsData) {
    if (newParameters.musics !== parameters.getSettings().musics) changeEverySoundEffectVolume(newParameters.musics);
    if (newParameters.sfx !== parameters.getSettings().sfx) {
        print(newParameters.sfx)
        changeEverySoundEffectVolume(newParameters.sfx)
        changeEveryMachineSoundEffectVolume(newParameters.sfx)
    };
}

function setSoundVolume(sound: Sound, volume: number) {
    const baseVolume = sound.FindFirstChild("BaseVolume") as NumberValue;
    sound.Volume = baseVolume.Value * volume;
}

export function changeEverySoundEffectVolume(volume: number) {
    for (const sound of ReplicatedStorage.WaitForChild("Sounds").WaitForChild("SFX").GetChildren()) {
        if (!sound.IsA("Sound")) continue;

        setSoundVolume(sound as Sound, volume);
    }
}

export function changeEveryMachineSoundEffectVolume(volume: number) {
    const player = Players.LocalPlayer;
    if (!player) error("This script must be run on the client");

    for (const machine of Workspace.FindFirstChild("plots")!.FindFirstChild(player.UserId)!.FindFirstChild("PlacedObjects")!.GetChildren()) {
        for (const sound of machine.GetChildren()) {
            if (!sound.IsA("Sound")) continue;

            setSoundVolume(sound as Sound, volume);
        }
    }
}

export function setBaseVolumeValue() { 
    for (const machine of ReplicatedStorage.FindFirstChild("GridEntities")!.GetChildren()) {
        for (const sound of machine.GetChildren()) {
            if (!sound.IsA("Sound")) continue;

            setBaseVolumeIntValue(sound as Sound);
        }
    }

    for (const category of ReplicatedStorage.FindFirstChild("Sounds")!.GetChildren()) {
        for (const sound of category.GetChildren()) {
            if (!sound.IsA("Sound")) continue;

            setBaseVolumeIntValue(sound as Sound);
        }
    }
}

function setBaseVolumeIntValue(sound: Sound) {
    const numberValue = new Instance("NumberValue", sound);

    numberValue.Name = "BaseVolume";
    numberValue.Value = sound.Volume;
}