import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

const baseUrl = process.env.NEXT_PUBLIC_URI;

export const EventConfirmedEmail = ({
  firstName,
  eventType,
  eventDate,
  eventTime,
  eventHours,
  eventGuests,
}) => {
  const previewText = `Booking ${eventType} for ${firstName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/text-logo-green.png`}
                width="200"
                height="75"
                alt="Gregor Golf"
                className="my-0 mx-auto"
              />
            </Section>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Booking <strong>{eventType}</strong> at Gregor Golf
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello {firstName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              You are now booked at Gregor Golf! See your booking details below.
            </Text>
            <Section className="mt-0">
              <Text className="m-0"><strong>Date: </strong>{eventDate}</Text>
              <Text className="m-0"><strong>Time: </strong>{eventTime}</Text>
              <Text className="m-0"><strong>Hours: </strong>{eventHours}</Text>
              <Text className="m-0"><strong>Guests: </strong>{eventGuests}</Text>
            </Section>
            <Text className="text-black text-[14px] leading-[24px]">
              If you have first-time guests, please have them sign this waiver!<br/>
              <strong>https://app.waiversign.com/e/64276294da72d0001966df71/doc/64276312da72d0001966e00f?event=none</strong>
            </Text>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              This booking confirmation was intended for{" "}
              <span className="text-black">{firstName}</span>. If you
              did not do this, please reply to
              this email to get in touch with us.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

EventConfirmedEmail.PreviewProps = {
  firstName: "Connor",
  eventType: "Joined",
  eventDate: "6/15/2024",
  eventTime: "2pm",
  eventHours: "1",
  eventGuests: "0",
};

export default EventConfirmedEmail;