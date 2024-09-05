local bindableFunction = game:GetService("ReplicatedStorage").Event.bindable.spawnComponent

function spawnItem(item) 	
	local find = false
	local i = 1
	local file = game:GetService("ReplicatedStorage").components.Grid
	local obj

	-- search in file the asked componentsd
	for _, category in pairs(file:GetChildren()) do
		obj = category:FindFirstChild(item)
		if obj ~= nil then
			find = true
		end
	end

	if find then
		-- if the file is found it clone the element
		local clone = obj:Clone()
		clone.Parent = game.Workspace.components
		return clone
	else
		return nil
	end
end

bindableFunction.OnInvoke = spawnItem




