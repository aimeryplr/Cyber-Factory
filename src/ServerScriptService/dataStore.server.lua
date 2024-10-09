local dataStore = game:GetService("DataStoreService"):GetDataStore("SaveData")

game.Players.PlayerAdded:Connect(function(player)
	-- Variables
	wait()
	local moneyValue = player.leaderstats.Money
	local tierValue = player.leaderstats.Tier	
	
	-- Save with the id of the player to recognise who the data belongs to
	local attempt = 0
	local success = false
	local getSaved
	-- tente d'avoir les sauvegarde déjà effectué
	repeat
		success, getSaved = pcall(function()
			return dataStore:GetAsync(player.UserId)
		end)
		attempt += 1
	until success or attempt == 5
	
	if getSaved then
		moneyValue.Value = getSaved[1]
		tierValue.Value = getSaved[2]
	else
		moneyValue.Value = 1000
		tierValue.Value = 0
	end
end)

game.Players.PlayerRemoving:Connect(function(player)
	local attempt = 0
	repeat
		local success, message = pcall(function()
			return dataStore:SetAsync(player.UserId, {player.leaderstats.Money.Value, player.leaderstats.Tier.Value})
		end)
		attempt += 1
	until success or attempt >= 5 
end)