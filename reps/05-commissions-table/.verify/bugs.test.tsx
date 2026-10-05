import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await screen.findByText("12 bookings this quarter", {}, { timeout: 3000 });
}

describe("rep 05: page works outside the planted bugs", () => {
  it("lists bookings with a total, and the button starts one export", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Total label")).toHaveTextContent("Total for 12 bookings");
    expect(screen.getByLabelText("Total commission")).toHaveTextContent("$6,727");
    await user.click(screen.getByRole("button", { name: "Export filtered rows" }));
    await waitFor(() => expect(screen.getByLabelText("Exports started")).toHaveTextContent("Exports started: 1"), { timeout: 3000 });
    expect(screen.getByLabelText("Export log")).toHaveTextContent("12 rows (all, all dates)");
  });
  it("filters by a date range that starts on the first day", async () => {
    await loadPage();
    fireEvent.change(screen.getByLabelText("Travel from"), { target: { value: "2026-10-01" } });
    expect(screen.getByLabelText("Total label")).toHaveTextContent("Total for 10 bookings");
    expect(screen.getByText("Leo Castellano")).toBeInTheDocument();
  });
});

describe("rep 05: the three planted bugs reproduce", () => {
  it("COM-702: pressing E starts several exports after touching the filters", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status"), "Pending");
    await user.selectOptions(screen.getByLabelText("Status"), "all");
    fireEvent.keyDown(window, { key: "e" });
    await waitFor(() => expect(screen.getByLabelText("Exports started")).toHaveTextContent("Exports started: 4"), { timeout: 3000 });
  });
  it("COM-705: choosing Paid shows nothing", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status"), "Paid");
    expect(screen.getByText("No bookings match these filters.")).toBeInTheDocument();
  });
  it("COM-709: the last day of the range is left out", async () => {
    await loadPage();
    fireEvent.change(screen.getByLabelText("Travel from"), { target: { value: "2026-10-01" } });
    fireEvent.change(screen.getByLabelText("Travel to"), { target: { value: "2026-10-15" } });
    expect(screen.getByLabelText("Total label")).toHaveTextContent("Total for 5 bookings");
    expect(screen.queryByText("Fatima El-Amin")).not.toBeInTheDocument();
    expect(screen.getByText("Leo Castellano")).toBeInTheDocument();
  });
});
