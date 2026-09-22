import React from "react";
type TProps = {
  title: string;
  subTitle: string;
};
export default function SectionTitle({ title, subTitle }: TProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-base font-semibold text-primary-color">{subTitle}</p>
      <p className="text-[28px] font-bold text-black">{title}</p>
    </div>
  );
}
