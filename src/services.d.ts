type generatorMenu = Frame & {
	UICorner: UICorner;
	ressources: Frame & {
		UIListLayout: UIListLayout;
		polymer: Frame & {
			price: Frame & {
				UIListLayout: UIListLayout;
				TextLabel: TextLabel;
				ImageLabel: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			TextLabel: TextLabel;
			ImageButton: ImageButton & {
				UICorner: UICorner;
				UIStroke: UIStroke;
			};
		};
		copper: Frame & {
			price: Frame & {
				UIListLayout: UIListLayout;
				TextLabel: TextLabel;
				ImageLabel: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			TextLabel: TextLabel;
			ImageButton: ImageButton & {
				UICorner: UICorner;
				UIStroke: UIStroke;
			};
		};
		carbon: Frame & {
			price: Frame & {
				UIListLayout: UIListLayout;
				TextLabel: TextLabel;
				ImageLabel: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
			UIAspectRatioConstraint: UIAspectRatioConstraint;
			TextLabel: TextLabel;
			ImageButton: ImageButton & {
				UICorner: UICorner;
				UIStroke: UIStroke;
			};
		};
	};
	progression: Frame & {
		UIListLayout: UIListLayout;
		speed: TextLabel;
		progressionBar: Frame & {
			UICorner: UICorner;
			UIStroke: UIStroke;
			bar: Frame & {
				UICorner: UICorner;
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


type crafterMenu = Frame & {
	UICorner: UICorner;
	craft: Frame & {
		speed: TextLabel;
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
		progression: Frame & {
			UIListLayout: UIListLayout;
			["1itemIn"]: ImageLabel & {
				UICorner: UICorner;
				UIStroke: UIStroke;
				TextLabel: TextLabel;
				UIAspectRatioConstraint: UIAspectRatioConstraint;
			};
			["2progressionBar"]: Frame & {
				UICorner: UICorner;
				UIStroke: UIStroke;
				bar: Frame & {
					UICorner: UICorner;
				};
			};
			["3itemOut"]: ImageLabel & {
				UICorner: UICorner;
				UIStroke: UIStroke;
				TextLabel: TextLabel;
				UIAspectRatioConstraint: UIAspectRatioConstraint;
			};
		};
	};
	searchCraft: ScrollingFrame & {
		UIListLayout: UIListLayout;
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
		speed: TextLabel;
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
				UICorner: UICorner;
				UIStroke: UIStroke;
				UIAspectRatioConstraint: UIAspectRatioConstraint;
				TextLabel: TextLabel;
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

type itemPrefab = ImageLabel & {
	UICorner: UICorner;
	UIStroke: UIStroke;
	UIAspectRatioConstraint: UIAspectRatioConstraint;
	TextLabel: TextLabel;
}

type itemName = Frame & {
	UICorner: UICorner;
	itemName: TextLabel & {
		UICorner: UICorner;
	};
	UIStroke: UIStroke;
}
