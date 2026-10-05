import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

async function toRooms() {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("heading", { level: 1 }, { timeout: 3000 });
  await user.type(screen.getByLabelText("Lead traveler"), "Leo Castellano");
  await user.type(screen.getByLabelText("Email"), "leo.c@example.com");
  await user.click(screen.getByRole("button", { name: "Next: rooms and dates" }));
  await screen.findByLabelText("Check-in");
  return user;
}
function tableOrder() {
  return within(screen.getByLabelText("Room type comparison")).getAllByRole("row").slice(1).map((r) => r.querySelector("td")!.textContent);
}
function optionOrder() {
  return Array.from((screen.getByLabelText("Room 1 type") as HTMLSelectElement).options).map((o) => o.value);
}

describe("rep 03: page works outside the planted bugs", () => {
  it("validates the traveler step and blocks Next until valid", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("heading", { level: 1 }, { timeout: 3000 });
    await user.click(screen.getByRole("button", { name: "Next: rooms and dates" }));
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
    expect(screen.queryByLabelText("Check-in")).not.toBeInTheDocument();
  });
  it("prices a normal stay and confirms the booking", async () => {
    const user = await toRooms();
    expect(screen.getByLabelText("Booking summary")).toHaveTextContent("1 room, 2 guests");
    expect(screen.getByLabelText("Booking summary")).toHaveTextContent("$720");
    await user.click(screen.getByRole("button", { name: "Next: review" }));
    await waitFor(() => expect(screen.getByLabelText("Quote total")).toHaveTextContent("$806.40"), { timeout: 3000 });
    await user.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(await screen.findByRole("status", {}, { timeout: 3000 })).toHaveTextContent(/Booking confirmed. Reference FORA-\d{6}, total \$806.40/);
  });
});

describe("rep 03: the three planted bugs reproduce", () => {
  it("BKG-402: Add room does nothing until something else changes, and the summary still says 1 room", async () => {
    const user = await toRooms();
    await user.click(screen.getByRole("button", { name: "Add room" }));
    expect(screen.getAllByTestId("room-row")).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-17" } });
    expect(screen.getAllByTestId("room-row")).toHaveLength(2);
    expect(screen.getByLabelText("Booking summary")).toHaveTextContent("1 room, 2 guests");
  });
  it("BKG-407: a 21-night stay prices as $0.00 with Confirm enabled", async () => {
    const user = await toRooms();
    fireEvent.change(screen.getByLabelText("Check-in"), { target: { value: "2026-11-01" } });
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-22" } });
    await user.click(screen.getByRole("button", { name: "Next: review" }));
    await waitFor(() => expect(screen.getByLabelText("Quote total")).toHaveTextContent("$0.00"), { timeout: 3000 });
    expect(screen.getByRole("button", { name: "Confirm booking" })).toBeEnabled();
    expect(screen.queryByText(/manual quote/)).not.toBeInTheDocument();
  });
  it("BKG-411: unchecking Cheapest first leaves the table (and the dropdown) in price order", async () => {
    const user = await toRooms();
    expect(tableOrder()).toEqual(["Standard King", "Deluxe Terrace", "Garden Suite", "Penthouse"]);
    expect(optionOrder()).toEqual(["standard", "deluxe", "suite", "penthouse"]);
    await user.click(screen.getByLabelText("Cheapest first"));
    expect(tableOrder()).toEqual(["Standard King", "Garden Suite", "Deluxe Terrace", "Penthouse"]);
    await user.click(screen.getByLabelText("Cheapest first"));
    expect(tableOrder()).toEqual(["Standard King", "Garden Suite", "Deluxe Terrace", "Penthouse"]);
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-17" } });
    expect(optionOrder()).toEqual(["standard", "suite", "deluxe", "penthouse"]);
  });
});
