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

describe("rep 03: your fixes", () => {
  it("BKG-402 fixed: Add room appears immediately and the summary counts it", async () => {
    const user = await toRooms();
    await user.click(screen.getByRole("button", { name: "Add room" }));
    expect(screen.getAllByTestId("room-row")).toHaveLength(2);
    expect(screen.getByLabelText("Booking summary")).toHaveTextContent("2 rooms, 4 guests");
    expect(screen.getByLabelText("Booking summary")).toHaveTextContent("$1,440");
  });
  it("BKG-407 fixed: a 21-night stay shows the supplier desk message and no total", async () => {
    const user = await toRooms();
    fireEvent.change(screen.getByLabelText("Check-in"), { target: { value: "2026-11-01" } });
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-22" } });
    await user.click(screen.getByRole("button", { name: "Next: review" }));
    expect(await screen.findByText(/manual quote/, {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.queryByLabelText("Quote total")).not.toHaveTextContent("$0.00");
    expect(screen.getByRole("button", { name: "Confirm booking" })).toBeDisabled();
  });
  it("BKG-411 fixed: unchecking Cheapest first restores size order and the dropdown never changes", async () => {
    const user = await toRooms();
    await user.click(screen.getByLabelText("Cheapest first"));
    expect(tableOrder()).toEqual(["Standard King", "Garden Suite", "Deluxe Terrace", "Penthouse"]);
    await user.click(screen.getByLabelText("Cheapest first"));
    expect(tableOrder()).toEqual(["Standard King", "Deluxe Terrace", "Garden Suite", "Penthouse"]);
    fireEvent.change(screen.getByLabelText("Check-out"), { target: { value: "2026-11-17" } });
    expect(optionOrder()).toEqual(["standard", "deluxe", "suite", "penthouse"]);
  });
  it("the rest of the page still works", async () => {
    const user = await toRooms();
    await user.click(screen.getByRole("button", { name: "Next: review" }));
    await waitFor(() => expect(screen.getByLabelText("Quote total")).toHaveTextContent("$806.40"), { timeout: 3000 });
    await user.click(screen.getByRole("button", { name: "Confirm booking" }));
    expect(await screen.findByRole("status", {}, { timeout: 3000 })).toHaveTextContent(/Booking confirmed/);
  });
});
