import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function loadPage() {
  render(<App />);
  await waitFor(() => expect(screen.getByLabelText("Trip count")).toHaveTextContent("10 trips"), { timeout: 3000 });
}

describe("rep 07: page works outside the planted bugs", () => {
  it("lists trips in date order with a booked total and filters by status", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Trip count")).toHaveTextContent("$70,700 booked");
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Paris");
    await user.selectOptions(screen.getByLabelText("Status filter"), "completed");
    expect(screen.getByLabelText("Trip count")).toHaveTextContent("2 trips, $9,100 booked");
  });
  it("searches after a pause and opens a drawer with correct dates", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Search trips"), "kyoto");
    await waitFor(() => expect(screen.getByLabelText("Trip count")).toHaveTextContent("1 trips"), { timeout: 3000 });
    await user.click(screen.getByRole("button", { name: "Open Kyoto" }));
    expect(screen.getByLabelText("Trip drawer")).toHaveTextContent("Kyoto for Hiro Tanaka");
    expect(screen.getByLabelText("Drawer dates")).toHaveTextContent("Mar 28, 2027 to Apr 8, 2027");
  });
});

describe("rep 07: the three planted bugs reproduce", () => {
  it("TRP-911: typing six letters sends six requests", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Requests sent")).toHaveTextContent("Requests sent: 1");
    await user.type(screen.getByLabelText("Search trips"), "lisbon");
    await new Promise((r) => setTimeout(r, 1200));
    expect(screen.getByLabelText("Requests sent")).toHaveTextContent("Requests sent: 7");
  });
  it("TRP-914: the drawer's Close button does nothing", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Lisbon" }));
    expect(screen.getByLabelText("Trip drawer")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close drawer" }));
    expect(screen.getByLabelText("Trip drawer")).toBeInTheDocument();
  });
  it("TRP-918: the timeline shows every trip a day early, the drawer doesn't", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(screen.getByLabelText("Dates for Lisbon")).toHaveTextContent("Nov 2 to Nov 9");
    await user.click(screen.getByRole("button", { name: "Open Lisbon" }));
    expect(screen.getByLabelText("Drawer dates")).toHaveTextContent("Nov 3, 2026 to Nov 10, 2026");
  });
});
