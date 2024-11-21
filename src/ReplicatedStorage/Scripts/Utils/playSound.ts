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