import * as React from "react";
const { withSelect } = window.wp.data;
const { dateI18n, getSettings } = window.wp.date;
import { ErrorText, Heading, Body, BodySection } from "../styles";
import { RevisionLinks } from "./RevisionLinks";

export interface PostStatusProps {
  requirePublish?: boolean;
  actionString?: string;
  lastPublishedRevision?: any;
  lastArchivedRevision?: any;
  saved: boolean;
  published: boolean;
  updated: boolean;
  timestamp: string;
  url: string;
  isSavingPost: boolean;
  contentId?: number;
}

const Wrapper = Body.extend`
  margin-bottom: 16px;
`;

const ErrorHeading = Heading.extend`
  color: #f2524a;
`;

const NoMarginHeading = Heading.extend`
  margin-bottom: 0;
`;

class PostStatusComponent extends React.Component<PostStatusProps> {
  public render(): JSX.Element {
    let content;
    let heading = <Heading>Post Status</Heading>;
    if (this.props.published) {
      content = <p>Your post is published to your site and is ready to be published on the Civil network.</p>;
    } else {
      if (this.props.requirePublish) {
        heading = <ErrorHeading>Post Status</ErrorHeading>;
        content = (
          <ErrorText>
            Waiting for this post to be published on your site before you can publish to the Civil network.
          </ErrorText>
        );
      } else if (this.props.saved) {
        content = <p>Post saved.</p>;
      }
    }

    if (!this.props.saved && !(this.props.requirePublish && !this.props.published)) {
      content = (
        <>
          {content}
          <ErrorText>
            {this.props.isSavingPost ? (
              "Saving post..."
            ) : (
              <>
                Please save {this.props.published && "updates to"} this post before{" "}
                {this.props.actionString || "continuing"}.
              </>
            )}
          </ErrorText>
        </>
      );
    }

    if (this.props.contentId && this.props.lastPublishedRevision) {
      heading = <NoMarginHeading>Civil publish status</NoMarginHeading>;
      content = (
        <RevisionLinks
          lastArchivedRevision={this.props.lastArchivedRevision}
          lastPublishedRevision={this.props.lastPublishedRevision}
        />
      );
    }

    return (
      <Wrapper>
        <BodySection>
          {heading}
          {content}
        </BodySection>
      </Wrapper>
    );
  }
}

export const PostStatus = withSelect(
  (selectStore: any, ownProps: Partial<PostStatusProps>): Partial<PostStatusProps> => {
    const {
      getEditedPostAttribute,
      isEditedPostDirty,
      isCleanNewPost,
      isCurrentPostPublished,
      isSavingPost,
    } = selectStore("core/editor");

    const date = getEditedPostAttribute("date_gmt");
    const modifiedDate = getEditedPostAttribute("modified_gmt");

    return {
      requirePublish: ownProps.requirePublish,
      saved: !isEditedPostDirty() && !isCleanNewPost(),
      published: isCurrentPostPublished(),
      updated: modifiedDate && modifiedDate !== date,
      timestamp: modifiedDate || date,
      url: getEditedPostAttribute("link"),
      isSavingPost: isSavingPost(),
    };
  },
)(PostStatusComponent);
