type generatorMenu = Frame & {
	UICorner: UICorner;
	ressources: Frame & {
		UIListLayout: UIListLayout;
	};
	progression: Frame & {
		UIListLayout: UIListLayout;
		["3efficiency"]: Frame & {
			UIListLayout: UIListLayout;
			Icon: ImageLabel & {
				UIAspectRatioConstraint: UIAspectRatioConstraint;
			};
			efficiency: TextLabel;
		};
		["2progressionBar"]: Frame & {
			UICorner: UICorner;
			UIStroke: UIStroke;
			bar: Frame & {
				UICorner: UICorner;
			};
		};
		["1speed"]: TextLabel;
	};
	toptop: Frame & {
		top: Frame;
		UICorner: UICorner;
		title: TextLabel & {
			UIPadding: UIPadding;
		};
		close: ImageButton & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			close: LocalScript;
		};
	};
}


type crafterMenu = Frame & {
	UICorner: UICorner;
	craft: Frame & {
		progression: Frame & {
			UIListLayout: UIListLayout;
			["1itemIn"]: ImageLabel & {
				amount: TextLabel;
				UICorner: UICorner;
				UIStroke: UIStroke;
				UIAspectRatioConstraint: UIAspectRatioConstraint;
				speed: TextLabel;
			};
			["2progressionBar"]: Frame & {
				UICorner: UICorner;
				UIStroke: UIStroke;
				bar: Frame & {
					UICorner: UICorner;
				};
			};
			["3itemOut"]: ImageLabel & {
				amount: TextLabel;
				UICorner: UICorner;
				UIStroke: UIStroke;
				UIAspectRatioConstraint: UIAspectRatioConstraint;
				speed: TextLabel;
			};
		};
		itemName: TextLabel & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			price: Frame & {
				UIListLayout: UIListLayout;
				TextLabel: TextLabel;
				ImageLabel: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
		};
	};
	searchCraft: ScrollingFrame & {
		UIListLayout: UIListLayout;
		UIPadding: UIPadding;
	};
	toptop: Frame & {
		top: Frame;
		UICorner: UICorner;
		title: TextLabel & {
			UIPadding: UIPadding;
		};
		close: ImageButton & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			close: LocalScript;
		};
	};
}

type assemblerMenu = Frame & {
	UICorner: UICorner;
	craft: Frame & {
		progression: Frame & {
			UIListLayout: UIListLayout;
			["1itemIn"]: Frame & {
				UIListLayout: UIListLayout;
			};
			["2progressionBar"]: Frame & {
				UICorner: UICorner;
				UIStroke: UIStroke;
				bar: Frame & {
					UICorner: UICorner;
				};
			};
			["3itemOut"]: ImageLabel & {
				TextLabel: TextLabel;
				UICorner: UICorner;
				UIStroke: UIStroke;
				UIAspectRatioConstraint: UIAspectRatioConstraint;
				speed: TextLabel;
			};
		};
		itemName: TextLabel & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			price: Frame & {
				UIListLayout: UIListLayout;
				TextLabel: TextLabel;
				ImageLabel: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
		};
	};
	searchCraft: ScrollingFrame & {
		UIListLayout: UIListLayout;
		UIPadding: UIPadding;
		TextButton: TextButton & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			ImageLabel: ImageLabel & {
				UIAspectRatioConstraint: UIAspectRatioConstraint;
			};
		};
	};
	toptop: Frame & {
		top: Frame;
		UICorner: UICorner;
		title: TextLabel & {
			UIPadding: UIPadding;
		};
		close: ImageButton & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			close: LocalScript;
		};
	};
}

type itemPrefab = ImageLabel & {
	UICorner: UICorner;
	UIStroke: UIStroke;
	UIAspectRatioConstraint: UIAspectRatioConstraint;
	TextLabel: TextLabel;
}

type itemName = Frame & {
	UIPadding: UIPadding;
	["1itemName"]: TextLabel & {
		UICorner: UICorner;
		UIPadding: UIPadding;
	};
	UIListLayout: UIListLayout;
	UIStroke: UIStroke;
	UICorner: UICorner;
	["2price"]: Frame & {
		UIListLayout: UIListLayout;
		TextLabel: TextLabel;
		ImageLabel: ImageLabel & {
			UIAspectRatioConstraint: UIAspectRatioConstraint;
		};
	};
}

type questBoard = Frame & {
	quests: Frame & {
		["1top"]: Frame & {
			["1toptop"]: Frame & {
				top: Frame;
				title: TextLabel;
				UICorner: UICorner;
			};
		};
		UIListLayout: UIListLayout;
	};
	foldArrow: Frame & {
		UICorner: UICorner;
		UIStroke: UIStroke;
		UIAspectRatioConstraint: UIAspectRatioConstraint;
		arrow: ImageButton & {
			foldQuests: LocalScript;
		};
	};
}
