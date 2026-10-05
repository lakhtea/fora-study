import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByText("5 unread", {}, { timeout: 3000 });
}

describe("rep 12: your fixes", () => {
  it("NTF-510 fixed: a filter change sends exactly one request", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status filter"), "unread");
    await new Promise((r) => setTimeout(r, 1500));
    expect(screen.getByLabelText("Requests sent")).toHaveTextContent("Requests sent: 2");
    expect(screen.getByLabelText("Unread count")).toHaveTextContent("(showing 5)");
  });
  it("NTF-514 fixed: Unread and Read filters show the right rows", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.selectOptions(screen.getByLabelText("Status filter"), "unread");
    await screen.findByText(/showing 5/, {}, { timeout: 3000 });
    expect(within(screen.getByLabelText("Notifications")).getAllByRole("listitem")).toHaveLength(5);
    await user.selectOptions(screen.getByLabelText("Status filter"), "read");
    await screen.findByText(/showing 3/, {}, { timeout: 3000 });
  });
  it("NTF-519 fixed: the savings total adds up", async () => {
    await loadPage();
    expect(screen.getByLabelText("Savings total")).toHaveTextContent("$375.50");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Mark read 2" }));
    expect(screen.getByLabelText("Unread count")).toHaveTextContent("4 unread");
    await new Promise((r) => setTimeout(r, 300));
  });
});
