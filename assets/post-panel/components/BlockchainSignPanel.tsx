import * as React from "react";
import { EthAddress, ApprovedRevision } from "@joincivil/core";
import { ArticleSignPanelIcon, Modal, Button, buttonSizes } from "@joincivil/components";
import { SignatureData } from "../store/interfaces";
import { PanelWalletStatus } from "./PanelWalletStatus";
import { PostStatus } from "./PostStatus";
import { Signature } from "./Signature";
import {
  Wrapper,
  IconWrap,
  Heading,
  MainHeading,
  IntroSection,
  Body,
  BodySection,
  ErrorText,
  HelpText,
  ModalHeader,
  ModalP,
  ModalButtonContainer,
} from "../styles";

export interface BlockchainSignPanelProps {
  currentUserId: number;
  isWpEditor: boolean;
  signatures: SignatureData;
  signDisabled: boolean;
  isDirty: boolean;
  isSavingPost: boolean;
  latestRevisionJson: any;
  postAuthors: any[];
  currentUserIsPostAuthor: boolean;
  signArticle(cb: () => void): Promise<void>;
  isValidSignature(signature: ApprovedRevision): boolean;
}

export interface BlockchainSignPanelState {
  isSignSuccessModalOpen: boolean;
}

export class BlockchainSignPanelComponent extends React.Component<BlockchainSignPanelProps, BlockchainSignPanelState> {
  constructor(props: BlockchainSignPanelProps) {
    super(props);
    this.state = {
      isSignSuccessModalOpen: false,
    };
  }

  public render(): JSX.Element {
    const ownSigData = this.props.signatures[this.props.currentUserId];
    const ownSigValid = ownSigData && this.props.isValidSignature(ownSigData);
    const needsReSign = ownSigData && ownSigValid === false;
    const ownSig = <Signature authorUserId={this.props.currentUserId} sigData={ownSigData} isValid={ownSigValid} />;

    const othersSigs = Object.entries(this.props.signatures)
      .filter(
        ([userId, sigData]: [string, ApprovedRevision]): boolean => parseInt(userId, 10) !== this.props.currentUserId,
      )
      .map(
        ([userId, sigData]: [string, ApprovedRevision]): JSX.Element => (
          <Signature
            authorUserId={parseInt(userId, 10)}
            sigData={sigData}
            isValid={this.props.isValidSignature(sigData)}
          />
        ),
      )
      // create placeholder signature elements for any remaining post authors who haven't signed:
      .concat(
        this.props.postAuthors
          .filter(author => !this.props.signatures[author.ID] && author.ID !== this.props.currentUserId)
          .map(author => <Signature authorUserId={author.ID} />),
      );

    let buttonText = (needsReSign ? "Re-s" : "S") + "ign Post";
    if (ownSigValid === null || this.props.isSavingPost) {
      buttonText = "Validating...";
    }

    return (
      <Wrapper>
        <IntroSection>
          <Heading>Sign</Heading>
          <p>
            We recommend you sign your posts for enhanced credibility.
            {this.props.currentUserIsPostAuthor
              ? " By signing this post, you are acknowledging that you are its author and are fully aware of its content. "
              : " By signing this post, you are acknowledging that you are fully aware of its content as a representative of your newsroom. "}
            {/*TODO confirm this copy*/}
            <a href="#TODO">Learn more</a>
          </p>
        </IntroSection>
        <Body>
          <PanelWalletStatus />
          <PostStatus actionString="signing" />

          <BodySection>
            <MainHeading>
              Signatures
              <IconWrap style={{ top: 5 }}>
                <ArticleSignPanelIcon />
              </IconWrap>
            </MainHeading>

            {!this.props.signDisabled &&
              (needsReSign ? (
                <ErrorText>Post updated and signature is no longer valid. Needs to be re-signed.</ErrorText>
              ) : (
                <p>Post ready to sign.</p>
              ))}
            {ownSig}

            <HelpText disabled={this.props.signDisabled}>
              This will open a MetaMask pop-up that will ask you to sign a statement. Note: this step is optional.
            </HelpText>
            <p>
              <Button size={buttonSizes.MEDIUM_WIDE} fullWidth disabled={this.props.signDisabled} onClick={this.sign}>
                {buttonText}
              </Button>
            </p>
          </BodySection>

          {this.props.isWpEditor && !!othersSigs.length && <BodySection>{othersSigs}</BodySection>}
        </Body>
        {this.renderSignSuccessModal()}
      </Wrapper>
    );
  }

  private renderSignSuccessModal(): JSX.Element | null {
    if (!this.state.isSignSuccessModalOpen) {
      return null;
    }
    return (
      <Modal>
        <ModalHeader>Post signed!</ModalHeader>
        <ModalP>Your post was successfully signed.</ModalP>
        <ModalP>
          Note that any time an update to your post is published to your site, we recommend you also update your
          signature.
        </ModalP>
        <ModalButtonContainer>
          <Button size={buttonSizes.MEDIUM_WIDE} onClick={() => this.setState({ isSignSuccessModalOpen: false })}>
            Close
          </Button>
        </ModalButtonContainer>
      </Modal>
    );
  }

  private sign = async () => {
    this.props.signArticle(() => {
      this.setState({ isSignSuccessModalOpen: true });
    });
  };
}
