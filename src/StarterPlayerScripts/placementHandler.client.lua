--Services
local player = game:GetService("Players").LocalPlayer
local mouse = player:GetMouse()
local replicatedStorage = game:GetService("ReplicatedStorage")
local runService = game:GetService("RunService")
local userInputService = game:GetService("UserInputService")
local tweenService = game:GetService("TweenService")

--Key
local terminateKey = Enum.UserInputType.MouseButton1
local rotateKey = Enum.KeyCode.R

--Parameters
local GRID_SIZE = 3
local LERP_SPEED = 0.5
local PLACING_TRANSPARENCY = 0.3

--Grid Parameters
local gridBase = workspace:WaitForChild("plot")
local placedObjects = gridBase.PlacedObjects

--object values
local object
local size
local rotation = math.rad(gridBase.Orientation.Y)
local targetPos

--Bools
local isPlacing = false

local function calculateObjectPos(obj)
	local plotOffset = Vector2.new(gridBase.Position.X % GRID_SIZE, gridBase.Position.Z % GRID_SIZE)
	
	local mouseRay = mouse.UnitRay
	local castRay = Ray.new(mouseRay.Origin, mouseRay.Direction * 1000)
	local ignoreList = {obj}
	local hit, position = workspace:FindPartOnRayWithIgnoreList(castRay, ignoreList)
	if hit == gridBase then
		--tkt mon reuf
		local x = math.floor((position.X - plotOffset.X) / GRID_SIZE) * GRID_SIZE + plotOffset.X 
		local y = 2 * gridBase.Size.Y + gridBase.Position.Y
		local z = math.floor((position.Z - plotOffset.Y) / GRID_SIZE) * GRID_SIZE + plotOffset.Y
		if size.X % 2 == 1 then x += GRID_SIZE / 2 end
		if size.Y % 2 == 1 then z += GRID_SIZE / 2 end
		return Vector3.new(x, y, z)
	end
end

local function calculateSize()
	local x = math.floor(object.Size.X / GRID_SIZE)
	local z = math.floor(object.Size.Z / GRID_SIZE)
	size = Vector2.new(x,z)
end

local function checkPlacement(pos)
	local x = math.floor((pos.X - gridBase.Position.X) / GRID_SIZE) * GRID_SIZE + gridBase.Size.X / 2 
	local y = math.floor((pos.Z - gridBase.Position.Z) / GRID_SIZE) * GRID_SIZE + gridBase.Size.Z / 2

	if x >= gridBase.Size.X - math.ceil(size.X / 2 - 1) * GRID_SIZE or x < math.floor(size.X / 2) * GRID_SIZE then return false
	elseif y >= gridBase.Size.Z - math.ceil(size.Y / 2 - 1) * GRID_SIZE or y < math.floor(size.Y / 2) * GRID_SIZE then return false end

	return true
end

local function isPlaceable()
	--check if the object collide with another
	return #workspace:GetPartsInPart(object) == 0
end

local function moveObj()
	if object then
		local newPos = calculateObjectPos(object)
		if newPos ~= nil and checkPlacement(newPos) then
			targetPos = newPos
		end
		if targetPos ~= nil then
			object.CFrame = object.CFrame:lerp(CFrame.new(targetPos) * CFrame.fromOrientation(0, rotation, 0), LERP_SPEED)
		end
	end
end

local function setupObject()
	object.Anchored = true
	object.CanCollide = false
	object.Parent = placedObjects
	object.Transparency = PLACING_TRANSPARENCY
end

--activate placing for an object
local function activatePlacing(obj)
	object = obj:Clone()
	if object ~= nil then
		calculateSize()
		isPlacing = true
		setupObject()
		
		runService:BindToRenderStep("Input", Enum.RenderPriority.Input.Value, moveObj)
	end
end

--terminate and place the object
local function desactivatePlacing()
	isPlacing = false
	runService:UnbindFromRenderStep("Input")
	rotation = 0
	object.CanCollide = true
	object.Transparency = 0
end

local function rotate()
	rotation += math.rad(90)
	if rotation == math.rad(360) then
		rotation = 0
	end
	size = Vector2.new(size.Y, size.X)
end


userInputService.InputBegan:Connect(function(input, gameProcessedEvent)
	if not gameProcessedEvent then
		if input.UserInputType == terminateKey and isPlaceable() then
			desactivatePlacing()		
		end
		if input.KeyCode == rotateKey and isPlacing then
			rotate()
		end
		-- A modifier
		if input.KeyCode == Enum.KeyCode.E and not isPlacing then
			activatePlacing(replicatedStorage.Entities.GridEntities.conveyer)
		end
		if input.KeyCode == Enum.KeyCode.X and not isPlacing then
			activatePlacing(replicatedStorage.Entities.GridEntities.conveyer)
		end
	end
end)

