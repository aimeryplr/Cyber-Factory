game.Players.PlayerAdded:Connect(function(player) 
	--someone join the game
	
	--leaderstat
	local stats = Instance.new("IntValue")
	stats.Name = "leaderstats"
	
	local money = Instance.new("IntValue", stats)
	money.Name = "Money"
	
	local tier = Instance.new("StringValue", stats)
	tier.Name = "Tier"
	tier.Value = "Tier 1"
	
	stats.Parent = player
	
end)