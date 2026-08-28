import { getClubContent } from "@/src/lib/content/store";
import { resolveSchedule } from "@/src/lib/content/schedule";
import { FlowReveal } from "@/src/components/FlowReveal";
import { WeeklySchedule } from "@/src/components/WeeklySchedule";

/**
 * Homepage "This Week at Astra" band. Reads the club's published schedule (or the
 * seeded placeholders while nothing is published) on the server, then hands it to
 * the client WeeklySchedule which derives the live "today / next / now" accents.
 */
export async function ScheduleSection() {
  const content = await getClubContent();
  const { training, specialEvents } = resolveSchedule(content);
  return (
    // id: the Club Essentials "Fixtures & Events" card links here — this band IS
    // the training calendar and events rail, so it is the destination rather than
    // a separate page.
    <FlowReveal className="section-band band-fog" id="schedule">
      {/* No data-touchline-node here: the floating ball overlaps this dense
          schedule grid (esp. on mobile), so the ball skips this section. */}
      <div className="container-wide">
        <WeeklySchedule training={training} specialEvents={specialEvents} />
      </div>
    </FlowReveal>
  );
}
