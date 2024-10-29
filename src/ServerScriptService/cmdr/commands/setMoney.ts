const addMoney = {
    Name: "setmoney",
	Aliases: ["sm"],
	Description: "set the money amount to yourself.",
	Group: "Admin",
	Args: [
		{
			Type: "number",
			Name: "money",
			Description: "Amount of money to set"
		}
	]
}

export = addMoney;