import type { DinoEntry, Stage } from "@/lib/types";
import { DIET_COLORS } from "@/lib/constants";

interface DinoInfoProps {
  dino: DinoEntry;
  stage: Stage;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-1.5 border-b border-border-default last:border-b-0">
      <span className="font-body text-[13px] font-medium text-text-secondary">
        {label}
      </span>
      <span className="font-body text-[13px] text-text-primary text-right">
        {value}
      </span>
    </div>
  );
}

export function DinoInfo({ dino, stage }: DinoInfoProps) {
  const stageData = dino.stages[stage];
  const dietInfo = DIET_COLORS[dino.diet];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-card p-4 shadow-sm border border-border-default">
        <h3 className="font-body text-base font-bold text-text-primary mb-2">
          Info
        </h3>
        <div>
          <InfoRow label="Era" value={dino.period} />
          <InfoRow label="Region" value={dino.region} />
          <InfoRow label="Type" value={dino.type} />
          <InfoRow
            label="Diet"
            value={`${dietInfo.emoji} ${dino.diet.charAt(0).toUpperCase() + dino.diet.slice(1)}`}
          />
          <InfoRow label="Locomotion" value={dino.locomotion.charAt(0).toUpperCase() + dino.locomotion.slice(1)} />
          <InfoRow
            label="Discovered"
            value={`${dino.discoveredBy}, ${dino.discoveredYear}`}
          />
        </div>
      </div>

      <div className="bg-white rounded-card p-4 shadow-sm border border-border-default">
        <h3 className="font-body text-base font-bold text-text-primary mb-2">
          About this stage
        </h3>
        <p className="font-body text-sm text-text-secondary leading-relaxed">
          {stageData.description}
        </p>
        <p className="font-body text-xs text-text-muted mt-2">
          <span className="font-medium">Diet:</span> {stageData.dietDescription}
        </p>
      </div>

      <div className="bg-white rounded-card p-4 shadow-sm border border-border-default">
        <h3 className="font-body text-base font-bold text-text-primary mb-2">
          Fun Fact
        </h3>
        <p className="font-body text-sm text-text-secondary leading-relaxed italic">
          {dino.funFact}
        </p>
      </div>
    </div>
  );
}
