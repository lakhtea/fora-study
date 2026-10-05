import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await waitFor(() => expect(screen.getByLabelText("Trip count")).toHaveTextContent("10 trips"), { timeout: 3000 });
}

describe("rep 07: your fixes", () => {
  it("TRP-911 fixed: typing six letters sends one request", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Search trips"), "lisbon");
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.getByLabelText("Requests sent")).toHaveTextContent("Requests sent: 2");
    expect(screen.getByLabelText("Trip count")).toHaveTextContent("1 trips");
  });
  it("TRP-914 fixed: Close closes the drawer", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Lisbon" }));
    await user.click(screen.getByRole("button", { name: "Close drawer" }));
    expect(screen.queryByLabelText("Trip drawer")).not.toBeInTheDocument();
    expect(screen.getByText("Open a trip to see its details.")).toBeInTheDocument();
  });
  it("TRP-918 fixed: the timeline and the drawer agree", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Dates for Lisbon")).toHaveTextContent("Nov 3 to Nov 10");
    expect(screen.getByLabelText("Dates for Kyoto")).toHaveTextContent("Mar 28 to Apr 8");
    await user.click(screen.getByRole("button", { name: "Open Lisbon" }));
    expect(screen.getByLabelText("Drawer dates")).toHaveTextContent("Nov 3, 2026 to Nov 10, 2026");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status filter"), "completed");
    expect(screen.getByLabelText("Trip count")).toHaveTextContent("2 trips, $9,100 booked");
  });
});
