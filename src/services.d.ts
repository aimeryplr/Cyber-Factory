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
