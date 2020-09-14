class SubPage {
	constructor(id) {
		this.container = document.getElementById(id);
		if (!this.container) throw "Sub Page ID not found";
		if (!this.container.classList.contains("subPage")) throw "Sub Page doesnt have class [subPage]";

		let closeButton = this.container.querySelector(".close-modal");
		if (closeButton)
			closeButton.onclick = () => {
				this.hideBackdrop();
				this.container.classList.remove("activeDialog");
			};

	}

	show() {
		this.showBackdrop()
		this.container.classList.add("activeFull");
	}

	showDialog(options, saveCallback, deleteCallback) {
		let btnSave = this.container.querySelector(".spSaveButton");
		btnSave.onclick = saveCallback;

		let btnDeleteButton = this.container.querySelector(".spDeleteButton");
		btnDeleteButton.style.display = ''; //reset
		btnDeleteButton.onclick = deleteCallback;
		if (options) {
			if (options.title) {
				let h = this.container.querySelector(".spHeaderText");
				h.innerHTML = options.title;
			}
			if (options.saveText)
				btnSave.innerHTML = options.saveText;


			if (options.hideDelete)
				btnDeleteButton.style.display = 'none';

		}
		this.showBackdrop()
		this.container.classList.add("activeDialog");

	}

	close() {
		this.hideBackdrop();
		this.container.classList.remove("activeFull");
		this.container.classList.remove("activeDialog");
	}

	showBackdrop() {
		let backdrop = document.querySelector('#dialogBackdrop');
		if (backdrop) {
			return
		}
		backdrop = document.createElement('div');
		backdrop.setAttribute('id', 'dialogBackdrop');
		this.container.parentElement.appendChild(backdrop)
	}

	hideBackdrop() {
		let backdrop = document.querySelector('#dialogBackdrop');
		if (backdrop) {
			this.container.parentElement.removeChild(backdrop);
		}
	}
}