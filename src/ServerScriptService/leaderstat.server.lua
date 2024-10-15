game.Players.PlayerAdded:Connect(function(player) 
	--someone join the game
	
	--leaderstat
	local stats = Instance.new("IntValue")
	stats.Name = "leaderstats"
	
	local money = Instance.new("IntValue", stats)
	money.Name = "Money"
	
	local tier = Instance.new("IntValue", stats)
	tier.Name = "Tier"
	
	stats.Parent = player
	
end)