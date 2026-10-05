import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByText("4 pending, $4,720", {}, { timeout: 3000 });
}

describe("rep 21: page works outside the planted bugs", () => {
  it("approves one of mine and moves it out of pending", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Approve Daniel Reyes" }));
    await waitFor(() => expect(screen.queryByTestId("refund-502")).not.toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByLabelText("Pending summary")).toHaveTextContent("3 pending, $4,310");
    await user.selectOptions(screen.getByLabelText("Status filter"), "all");
    expect(within(screen.getByTestId("refund-502")).getByText("approved")).toBeInTheDocument();
  });
});

describe("rep 21: the three planted bugs reproduce", () => {
  it("RFD-120: denying the first request moves its note onto the next one", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.type(screen.getByLabelText("Note Maya Okafor"), "Call supplier first");
    await user.tab();
    await new Promise((r) => setTimeout(r, 400));
    await user.click(screen.getByRole("button", { name: "Deny Maya Okafor" }));
    await waitFor(() => expect(screen.queryByTestId("refund-501")).not.toBeInTheDocument(), { timeout: 3000 });
    expect(screen.getByLabelText("Note Daniel Reyes")).toHaveValue("Call supplier first");
  });
  it("RFD-124: approving another advisor's request does nothing and says nothing", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Approve Leo Castellano" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Approve Leo Castellano" })).toBeEnabled(), { timeout: 3000 });
    await new Promise((r) => setTimeout(r, 200));
    expect(within(screen.getByTestId("refund-503")).getByText("pending")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
  it("RFD-129: approving a request the desk already decided sticks on Working", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Approve Hiro Tanaka" }));
    await new Promise((r) => setTimeout(r, 1000));
    expect(screen.getByRole("button", { name: "Approve Hiro Tanaka" })).toHaveTextContent("Working");
    expect(screen.getByRole("button", { name: "Approve Hiro Tanaka" })).toBeDisabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    spy.mockRestore();
  });
});
