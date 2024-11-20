import { ReplicatedStorage } from "@rbxts/services";

export function getSoundEffect(soundName: string): Sound {
    const sound = ReplicatedStorage.WaitForChild("Sounds").WaitForChild("SFX").WaitForChild(soundName) as Sound;
    if (!sound) error(`Sound ${soundName} not found`);
 
    return sound;
}

/**
 * Duplicate the sound to not have to wait for it to finish playing
 * @param soundName The name of the sound to play
 */
export function playSoundEffectDuplicated(sound: Sound) {
    const newSound = sound.Clone();
    newSound.Parent = sound.Parent;
    newSound.Play();
    
    newSound.Ended.Connect(() => {
        newSound.Destroy();
    });
}

export function playSoundEffectAtRandomPitch(sound: Sound, min: number, max: number) {
    const newSound = sound.Clone();
    newSound.Parent = sound.Parent;

    const pitch = new Instance("PitchShiftSoundEffect", newSound);
    const rand = math.random(min * 100, max * 100) / 100;
    pitch.Octave = rand

    newSound.Play();

    newSound.Ended.Connect(() => {
        newSound.Destroy();
    });
}

export function playSoundEffectWithoutStopping(sound: Sound) {
    if (sound.Playing) return;
    
    sound.Play();
}