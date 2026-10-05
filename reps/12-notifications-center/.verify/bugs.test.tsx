import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByText("5 unread", {}, { timeout: 3000 });
}

describe("rep 12: page works outside the planted bugs", () => {
  it("lists notifications with the unread count and marks one read", async () => {
    const user = userEvent.setup();
    await loadPage();
    expect(within(screen.getByLabelText("Notifications")).getAllByRole("listitem")).toHaveLength(8);
    expect(screen.getByLabelText("Requests sent")).toHaveTextContent("Requests sent: 1");
    await user.click(screen.getByRole("button", { name: "Mark read 2" }));
    expect(screen.getByLabelText("Unread count")).toHaveTextContent("4 unread");
    expect(screen.queryByRole("button", { name: "Mark read 2" })).not.toBeInTheDocument();
    await new Promise((r) => setTimeout(r, 300));
  });
});

describe("rep 12: the three planted bugs reproduce", () => {
  it("NTF-510: choosing Unread sends requests nonstop", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status filter"), "Unread");
    await new Promise((r) => setTimeout(r, 1500));
    const count = Number(screen.getByLabelText("Requests sent").textContent!.match(/(\d+)/)![1]);
    expect(count).toBeGreaterThanOrEqual(5);
  });
  it("NTF-514: the Unread filter shows nothing while the header counts five unread", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status filter"), "Unread");
    await screen.findByText("No notifications here.", {}, { timeout: 3000 });
  });
  it("NTF-519: the savings total is $NaN", async () => {
    await loadPage();
    expect(screen.getByLabelText("Savings total")).toHaveTextContent("$NaN");
    expect(screen.getByText(/Largest: \$210.00/)).toBeInTheDocument();
  });
});
