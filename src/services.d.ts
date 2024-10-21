type generatorMenu = Frame & {
	UICorner: UICorner;
	ressources: Frame & {
		UIListLayout: UIListLayout;
		plastic: Frame & {
			price: Frame & {
				UIListLayout: UIListLayout;
				TextLabel: TextLabel;
				ImageLabel: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
			TextLabel: TextLabel;
			ImageLabel: ImageLabel & {
				UICorner: UICorner;
				UIStroke: UIStroke;
			};
		};
		gold: Frame & {
			price: Frame & {
				UIListLayout: UIListLayout;
				TextLabel: TextLabel;
				ImageLabel: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
			TextLabel: TextLabel;
			ImageLabel: ImageLabel & {
				UICorner: UICorner;
				UIStroke: UIStroke;
			};
		};
		iron: Frame & {
			price: Frame & {
				UIListLayout: UIListLayout;
				TextLabel: TextLabel;
				ImageLabel: ImageLabel & {
					UIAspectRatioConstraint: UIAspectRatioConstraint;
				};
			};
			TextLabel: TextLabel;
			ImageLabel: ImageLabel & {
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
