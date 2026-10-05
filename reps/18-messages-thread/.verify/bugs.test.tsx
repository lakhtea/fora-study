import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";
import { resetServer } from "../api/server";

beforeEach(() => resetServer());
afterEach(() => resetServer());
async function loadPage() {
  render(<App />);
  await screen.findByText("3 client conversations", {}, { timeout: 3000 });
}

describe("rep 18: page works outside the planted bugs", () => {
  it("opens a thread, shows messages, sends one, and shows the typing indicator for that client", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Daniel Reyes" }));
    await waitFor(() => expect(within(screen.getByLabelText("Messages")).getAllByRole("listitem")).toHaveLength(2), { timeout: 3000 });
    await user.type(screen.getByLabelText("Message text"), "Hello Daniel");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByText("Hello Daniel")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Typing indicator")).toHaveTextContent("Daniel Reyes is typing"), { timeout: 3000 });
  });
});

describe("rep 18: the three planted bugs reproduce", () => {
  it("MSG-220: after switching threads, the previous client's typing indicator keeps showing", async () => {
    await loadPage();
    fireEvent.click(screen.getByRole("button", { name: "Open Daniel Reyes" }));
    await new Promise((r) => setTimeout(r, 150));
    fireEvent.click(screen.getByRole("button", { name: "Open Maya Okafor" }));
    await waitFor(() => expect(screen.getByLabelText("Typing indicator")).toHaveTextContent("Daniel Reyes is typing"), { timeout: 3000 });
    expect(screen.getByLabelText("Thread heading")).toHaveTextContent("Maya Okafor");
  });
  it("MSG-224: every advisor message shows the sending clock", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Maya Okafor" }));
    await waitFor(() => expect(within(screen.getByLabelText("Messages")).getAllByRole("listitem")).toHaveLength(8), { timeout: 3000 });
    expect(screen.getByLabelText("Status 2")).toHaveTextContent("sending");
    expect(screen.getByLabelText("Status 6")).toHaveTextContent("sending");
  });
  it("MSG-229: switching Maya then Daniel quickly shows Maya's messages under Daniel's name", async () => {
    await loadPage();
    fireEvent.click(screen.getByRole("button", { name: "Open Maya Okafor" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Daniel Reyes" }));
    await new Promise((r) => setTimeout(r, 1500));
    expect(screen.getByLabelText("Thread heading")).toHaveTextContent("Daniel Reyes");
    expect(screen.getByLabelText("Messages")).toHaveTextContent("Lisbon is confirmed");
  });
});
