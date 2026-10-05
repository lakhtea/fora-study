import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

async function start() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByLabelText("Steps", {}, { timeout: 4000 });
  return user;
}
async function fillTraveler(user: ReturnType<typeof userEvent.setup>, email = "leo.c@example.com") {
  await user.type(screen.getByLabelText("Name"), "Leo Castellano");
  await user.type(screen.getByLabelText("Email"), email);
  await user.type(screen.getByLabelText("Phone"), "+1 773 555 0145");
  await user.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByLabelText("Check-in", {}, { timeout: 4000 });
}

describe("app 03 acceptance", () => {
  it("validates the traveler step on blur and on Next", async () => {
    const user = await start();
    expect(within(screen.getByLabelText("Steps")).getAllByText(/./)[0]).toHaveClass("active");
    await user.click(screen.getByLabelText("Email"));
    await user.type(screen.getByLabelText("Email"), "nope");
    await user.tab();
    expect(screen.getAllByRole("alert").some((a) => /email/i.test(a.textContent ?? ""))).toBe(true);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.queryByLabelText("Check-in")).not.toBeInTheDocument();
    expect(screen.getAllByRole("alert").length).toBeGreaterThanOrEqual(2);
  });
  it("moves through rooms with validation and keeps values on Back", async () => {
    const user = await start();
    await fillTraveler(user);
    fireEvent.change(screen.getByLabelText("Check-in"), { target: { value: "2026-11-12" } });
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-10" } });
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getAllByRole("alert").some((a) => /after/i.test(a.textContent ?? ""))).toBe(true);
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-16" } });
    await user.click(screen.getByRole("button", { name: "Add room" }));
    expect(screen.getByLabelText("Room 2 type")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove room 2" }));
    expect(screen.queryByLabelText("Room 2 type")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText("Name")).toHaveValue("Leo Castellano");
  });
  it("submits and shows the reference", async () => {
    const user = await start();
    await fillTraveler(user);
    fireEvent.change(screen.getByLabelText("Check-in"), { target: { value: "2026-11-12" } });
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-16" } });
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByLabelText("Review summary")).toHaveTextContent("Leo Castellano");
    await user.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(await screen.findByRole("status", {}, { timeout: 4000 })).toHaveTextContent(/Booking confirmed. Reference FORA-\d{6}/);
  });
  it("maps server field errors back onto the owning step", async () => {
    const user = await start();
    await fillTraveler(user, "leo.test@example.com");
    fireEvent.change(screen.getByLabelText("Check-in"), { target: { value: "2026-11-12" } });
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-16" } });
    fireEvent.change(screen.getByLabelText("Room 1 guests"), { target: { value: "5" } });
    await user.click(screen.getByRole("button", { name: "Next" }));
    await user.click(screen.getByRole("button", { name: "Confirm booking" }));
    await waitFor(() => expect(screen.getByLabelText("Email")).toBeInTheDocument(), { timeout: 4000 });
    expect(screen.getAllByRole("alert").some((a) => /Test addresses/.test(a.textContent ?? ""))).toBe(true);
  });
});
