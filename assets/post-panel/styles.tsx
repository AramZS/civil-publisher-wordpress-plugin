import * as React from "react";
import styled, { StyledComponentClass } from "styled-components";
import { CivilLogo } from "@joincivil/components";

export const colors = {
  LINK_BLUE: "#0073AA",
  GRAY: "#D8D8D8",
  ERROR_RED: "#F2524A",
};

export const Wrapper = styled.div`
  overflow-x: hidden;
  background-color: #edeff0;

  // TODO temporary until we separate them into tabs:
  &:first-child {
    border-bottom: 1px solid ${colors.GRAY};
  }

  p {
    margin-bottom: 10px;
    font-size: 13px;
    line-height: 1.31;
    letter-spacing: -0.1px;
    color: #5f5f5f;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const IconWrap = styled.span`
  position: relative;
  top: 2px;
`;

export interface HelpTextProps {
  disabled?: boolean;
}
export const HelpText: StyledComponentClass<HelpTextProps, "p"> = styled<HelpTextProps, "p">("p")`
  opacity: ${props => (props.disabled ? 0.3 : 1)};
  && {
    color: #72777c;
  }
`;

export const ErrorText = styled.p`
  && {
    font-weight: normal;
    color: ${colors.ERROR_RED};
  }
`;

export const Heading = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  letter-spacing: -0.2px;
  color: #23282d;

  ${IconWrap} {
    top: 3px;
    left: 6px;
    svg {
      width: 18px;
      height: 18px;
    }
  }

  ${ErrorText} {
    font-size: 13px;
    float: right;
  }
`;
export const MainHeading = Heading.extend`
  font-weight: 600;
`;
export const ErrorHeading = Heading.extend`
  font-weight: 600;
  color: ${colors.ERROR_RED};
`;

export const Intro = styled.div`
  background-color: #fffef6;
  padding: 24px 16px;
  border-bottom: 1px solid ${colors.GRAY};

  ${Heading} {
    font-size: 16px;
    letter-spacing: -0.3px;
  }
`;
export const IntroHeader = styled.div`
  margin-bottom: 24px;
  svg {
    height: 12px;
    width: auto;
  }
  a {
    float: right;
  }
`;

export const Body = styled.div`
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: solid 1px #dddddd;
  border-top: solid 1px #dddddd;
  &:first-child {
    border-top: none;
  }
`;
export const BodySection = styled.div`
  padding: 20px 0 24px;
  border-bottom: 1px solid ${colors.GRAY};
  &:last-child {
    border-bottom: 0;
  }
`;

export class IntroSection extends React.Component {
  public render(): JSX.Element {
    return (
      <Intro>
        <IntroHeader>
          <IconWrap>
            <CivilLogo />
          </IconWrap>
          <a href="#TODO">Help</a>
        </IntroHeader>
        {this.props.children}
      </Intro>
    );
  }
}

export const ModalHeader = styled.h2`
  font-size: 20px;
`;

export const ModalP = styled.p`
  font-size: 16px;
  color: #5f5f5f;
`;

export const ModalButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const PrimaryButtonWrap = styled.div`
  margin-top: 16px;
`;
