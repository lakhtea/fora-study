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

describe("rep 18: your fixes", () => {
  it("MSG-220 fixed: only the open thread's client can show as typing", async () => {
    await loadPage();
    fireEvent.click(screen.getByRole("button", { name: "Open Daniel Reyes" }));
    await new Promise((r) => setTimeout(r, 150));
    fireEvent.click(screen.getByRole("button", { name: "Open Maya Okafor" }));
    const seen = new Set<string>();
    const until = Date.now() + 2500;
    while (Date.now() < until) {
      seen.add(screen.getByLabelText("Typing indicator").textContent ?? "");
      await new Promise((r) => setTimeout(r, 50));
    }
    expect([...seen].some((t) => t.includes("Daniel"))).toBe(false);
    expect([...seen].some((t) => t.includes("Maya Okafor is typing"))).toBe(true);
  }, 10000);
  it("MSG-224 fixed: statuses render as delivered and read", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Maya Okafor" }));
    await waitFor(() => expect(within(screen.getByLabelText("Messages")).getAllByRole("listitem")).toHaveLength(8), { timeout: 3000 });
    expect(screen.getByLabelText("Status 2")).toHaveTextContent("read");
    expect(screen.getByLabelText("Status 6")).toHaveTextContent("delivered");
    expect(screen.getByLabelText("Status 6")).not.toHaveTextContent("sending");
  });
  it("MSG-229 fixed: the messages always belong to the heading", async () => {
    await loadPage();
    fireEvent.click(screen.getByRole("button", { name: "Open Maya Okafor" }));
    fireEvent.click(screen.getByRole("button", { name: "Open Daniel Reyes" }));
    await new Promise((r) => setTimeout(r, 1500));
    expect(screen.getByLabelText("Thread heading")).toHaveTextContent("Daniel Reyes");
    expect(within(screen.getByLabelText("Messages")).getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByLabelText("Messages")).not.toHaveTextContent("Lisbon is confirmed");
  });
  it("the rest of the page still works", async () => {
    const user = userEvent.setup();
    await loadPage();
    await user.click(screen.getByRole("button", { name: "Open Daniel Reyes" }));
    await waitFor(() => expect(within(screen.getByLabelText("Messages")).getAllByRole("listitem")).toHaveLength(2), { timeout: 3000 });
    await user.type(screen.getByLabelText("Message text"), "Hello Daniel");
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(screen.getByText("Hello Daniel")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Status 100")).toHaveTextContent("sending"), { timeout: 3000 });
  });
});
