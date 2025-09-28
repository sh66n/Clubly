import React from "react";
import { FeatureCard, Number, Title, Description } from "./FeatureCard";

export default function Features() {
  return (
    <div
      id="features"
      className="min-h-screen flex justify-center items-center relative"
    >
      <div className="flex flex-col items-center justify-center">
        <div className="heading text-[#5E77F5]">{"{ Features }"}</div>
        <div className="text-3xl mt-2">
          Everything your club needs, in{" "}
          <span className="italic text-[#3B5CFF]">one</span> platform.
        </div>
        <div className="text-[#717171] mt-1 text-center">
          Plan, manage, and grow your club with tools built for real engagement.
        </div>
        <div className="flex gap-6 mt-8 px-32">
          <FeatureCard>
            <Number>{"{ 01 }"}</Number>
            <Title>Event Management</Title>
            <Description>
              Easily schedule events, set RSVP deadlines, share event details,
              and track attendance—all in one streamlined flow.
            </Description>
          </FeatureCard>

          <FeatureCard>
            <Number>{"{ 02 }"}</Number>
            <Title>Member Directory</Title>
            <Description>
              Organize your members with detailed profiles, group filters, and
              activity histories—so you always know who’s active and involved.
            </Description>
          </FeatureCard>

          <FeatureCard>
            <Number>{"{ 03 }"}</Number>
            <Title>Point & Reward System</Title>
            <Description>
              Motivate participation with customizable point systems,
              leaderboards, and rewards that make engagement fun and meaningful.
            </Description>
          </FeatureCard>

          <FeatureCard>
            <Number>{"{ 04 }"}</Number>
            <Title>Analytics Dashboard</Title>
            <Description>
              Get real-time insights on attendance, participation trends, and
              event impact to make smarter decisions and grow your club.
            </Description>
          </FeatureCard>
        </div>
      </div>
    </div>
  );
}
