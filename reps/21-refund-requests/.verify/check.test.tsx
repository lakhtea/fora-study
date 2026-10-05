import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByText("4 pending, $4,720", {}, { timeout: 3000 });
}

describe("rep 21: your fixes", () => {
  it("RFD-120 fixed: notes stay with their request after a decision", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Note Maya Okafor"), "Call supplier first");
    await user.tab();
    await new Promise((r) => setTimeout(r, 400));
    await user.click(screen.getByRole("button", { name: "Deny Maya Okafor" }));
    await waitFor(() => expect(screen.queryByTestId("refund-501")).not.toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByLabelText("Note Daniel Reyes")).toHaveValue("");
    await user.selectOptions(screen.getByLabelText("Status filter"), "all");
    expect(screen.getByLabelText("Note Maya Okafor")).toHaveValue("Call supplier first");
  });
  it("RFD-124 fixed: another advisor's request shows the reason it can't be decided", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Approve Leo Castellano" }));
    expect(await screen.findByRole("alert", {}, { timeout: 3000 })).toHaveTextContent(/belongs to another advisor/);
    expect(screen.getByRole("button", { name: "Approve Leo Castellano" })).toBeEnabled();
  });
  it("RFD-129 fixed: an already-decided request explains itself and leaves the queue", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Approve Hiro Tanaka" }));
    expect(await screen.findByRole("alert", {}, { timeout: 3000 })).toHaveTextContent(/Already approved/);
    await waitFor(() => expect(screen.queryByTestId("refund-504")).not.toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByLabelText("Pending summary")).toHaveTextContent("3 pending");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Approve Daniel Reyes" }));
    await waitFor(() => expect(screen.queryByTestId("refund-502")).not.toBeInTheDocument(), { timeout: 3000 });
  });
});
