--name = object path/path/name, position = Vector3
function spawnItem(item, category, position) 	
	local find = false
	local i = 1
	local file = game:GetService("ReplicatedStorage").components.PC
	local obj
	
	-- search in file the asked component
	local category = file:FindFirstChild(category)
	
	if category ~= nil then
		obj = category:FindFirstChild(item)
		if obj ~= nil then
			find = true
		end
	end
	
	if find then
		-- if the file is found it clone the element
		local clone = file:Clone()
		clone.Parent = game.Workspace.components
		clone.Position = position
	else
		return 0
	end

end

--spawnItem(require(game.ReplicatedStorage.components.componentsModules.ramsModules[1].ram1), Vector3.new(0,10,0))

