//*** Controllers ***/

// Handles window resize events to update the view of the application.
class WindowResizeHandler {
  private debouncedUpdate: Function;
  private paginationManager: PaginationManager;
  private tableRenderer: TableRenderer;
  private stateManager: StateManager;

  /**
   * @param {TableRenderer} tableRenderer - Used for re-rendering table data.
   * @param {StateManager} stateManager - State control for retrieving/updating application data.
   */

  constructor(
    tableRenderer: TableRenderer,
    stateManager: StateManager,
    paginationManager: PaginationManager
  ) {
    this.debouncedUpdate = this.debounce(
      this.updateAfterResize.bind(this),
      350
    );
    this.paginationManager = paginationManager;
    this.tableRenderer = tableRenderer;
    this.stateManager = stateManager;

    // Attach event listener for window resize.
    this.setupEventListenersResize();
  }

  private setupEventListenersResize(): void {
    window.addEventListener("resize", () => this.handleResize());
  }

  handleResize(): void {
    this.debouncedUpdate();
  }

  //Debounce function to reduce the number of function calls while user is dragging the browser window.
  debounce(func: Function, delay: number): Function {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: any[]) => {
      const later = () => {
        timeout = null;
        func(...args);
      };
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(later, delay);
    };
  }

  async updateAfterResize(): Promise<void> {
    try {
      this.stateManager.adjustWindowSize();
      await this.stateManager.retrieveRecords();
      const records = this.stateManager.getRecords();

      if (records !== null) {
        this.tableRenderer.renderRecords(records);
      }
      this.paginationManager.updateButtonStates();
    } catch (error) {
      console.error(
        `Error in updateAfterResize: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}

// Handles pagination and search functionalities for the application's table view.
class PaginationManager {
  // DOM elements required for pagination and search.
  private prevButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;
  private searchButton: HTMLButtonElement;
  private mainHeading: HTMLElement;
  private filterInput: HTMLInputElement;
  private errorMessage: HTMLElement;

  /**
   * @param {TableRenderer} tableRenderer - Used for re-rendering table data.
   * @param {StateManager} stateManager - State control for retrieving/updating application data.
   */

  constructor(
    private tableRenderer: TableRenderer,
    private stateManager: StateManager
  ) {
    this.prevButton = document.getElementById("prevPage") as HTMLButtonElement;
    this.nextButton = document.getElementById("nextPage") as HTMLButtonElement;
    this.searchButton = document.getElementById(
      "searchButton"
    ) as HTMLButtonElement;
    this.mainHeading = document.getElementById("main-heading") as HTMLElement;
    this.filterInput = document.getElementById(
      "filterInput"
    ) as HTMLInputElement;
    this.errorMessage = document.getElementById("errorMessage") as HTMLElement;

    // Attach event listeners for buttons and other UI elements.
    this.setupEventListeners();
  }

  // Attaches event listeners to the relevant DOM elements to handle user interactions.
  private setupEventListeners(): void {
    if (this.prevButton) {
      this.prevButton.addEventListener("click", () => this.decrementPage());
    }

    if (this.nextButton) {
      this.nextButton.addEventListener("click", () => this.incrementPage());
    }

    if (this.searchButton) {
      this.searchButton.addEventListener("click", () => this.searchById());
    }

    if (this.filterInput) {
      this.filterInput.addEventListener("keyup", (event) => {
        // Check if the "Enter" key was pressed
        if (event.key === "Enter") {
          this.searchById();
        }
      });
    }

    if (this.mainHeading) {
      this.mainHeading.addEventListener("click", () => this.navigateToHome());
    }

    if (this.filterInput && this.errorMessage) {
      this.setupLiveValidation();
    }
  }

  // Navigates to the home page by reloading the window.
  navigateToHome(): void {
    try {
      window.location.reload();
    } catch (error) {
      console.error(
        `Error while navigating to home: ${
          error instanceof Error ? error.message : error
        }`
      );
      alert("Failed to reload the page. Please try again.");
    }
  }

  // Fetches the next set of records and updates the view.
  async incrementPage(): Promise<void> {
    try {
      this.stateManager.goToNextPage();
      await this.stateManager.retrieveRecords();
      const records = this.stateManager.getRecords();

      if (records !== null) {
        this.tableRenderer.renderRecords(records);
      }
      this.updateButtonStates();
    } catch (error) {
      console.error(
        `Unexpected error in incrementPage: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // Fetches the previous set of records and updates the view.
  async decrementPage(): Promise<void> {
    try {
      this.stateManager.goToPreviousPage();
      await this.stateManager.retrieveRecords();
      const records = this.stateManager.getRecords();

      if (records !== null) {
        this.tableRenderer.renderRecords(records);
      }

      this.updateButtonStates();
    } catch (error) {
      console.error(
        `Error in decrementPage: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // Searches for a record by its ID and updates the view.
  async searchById(): Promise<void> {
    try {
      const searchValue = parseInt(this.filterInput.value, 10);
      if (isNaN(searchValue)) {
        throw new Error("Invalid search value or none");
      }

      this.stateManager.setHighlightedId(searchValue);
      await this.stateManager.searchByIdStateChange(searchValue);

      const records = this.stateManager.getRecords();

      if (records !== null) {
        this.tableRenderer.renderRecords(records, searchValue);
      }

      this.updateButtonStates();
    } catch (error) {
      console.error(
        `Error in searchById function: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  // Validates input for the search bar in real-time.
  setupLiveValidation(): void {
    if (!this.filterInput || !this.errorMessage) {
      console.error(
        "Live validation setup failed: Required elements not found."
      );
      return;
    }

    this.filterInput.addEventListener("input", () => {
      const inputValue = this.filterInput.value;

      if (inputValue.length === 0) {
        this.errorMessage.textContent = "";
      } else if (
        inputValue.length < 1 ||
        inputValue.length > 6 ||
        !/^\d+$/.test(inputValue)
      ) {
        this.errorMessage.textContent =
          "Invalid input. Please enter a number between 0 and 999 999.";
      } else {
        this.errorMessage.textContent = "";
      }
    });
  }

  // Updates the state of the pagination buttons based on the current view.
  public updateButtonStates(): void {
    try {
      const from = this.stateManager.getFrom();
      const to = this.stateManager.getTo();
      const totalRecordCount = this.stateManager.getTotalRecordCount();

      this.prevButton.disabled = from === 0;
      this.nextButton.disabled = to === totalRecordCount - 1;
    } catch (error) {
      console.error(
        `Unexpected error in updateButtonStates: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }
}
