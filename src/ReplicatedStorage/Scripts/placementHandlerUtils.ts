/**
 * Setup the object in the grid
 * @param pos position in global
 * @param orientation in radians
 * @returns the object
*/
export const setupObject = (obj: BasePart, pos: Vector3, orientation: number, gridBase: BasePart): BasePart => {
    const newObject = obj.Clone();
    newObject.Position = pos;
    newObject.Orientation = new Vector3(0, orientation, 0);
    newObject.Anchored = true;
    newObject.CanCollide = true;
    newObject.Parent = gridBase.FindFirstChild("PlacedObjects")
    return newObject;
}