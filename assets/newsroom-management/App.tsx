const { apiRequest } = window.wp;
import * as React from "react";
import { connect, DispatchProp } from "react-redux";
import { Newsroom } from "@joincivil/newsroom-manager";
import { Civil, EthAddress, TxHash } from "@joincivil/core";
import { ManagerState } from "./reducer";
import { addAddress, addTxHash } from "./actions";
import { getNewsroomAddress, getCivil, hasInjectedProvider } from "../util";
import { apiNamespace, siteOptionKeys, userMetaKeys } from "../constants";
import { WalletStatus } from "./WalletStatus";
import { Modal, buttonSizes, Button } from "@joincivil/components";
import { SearchUsers } from "./SeachUsers";

export interface AppProps {
  address?: EthAddress;
  txHash?: TxHash;
}

const NETWORK_NAME = "rinkeby";
const NETWORK_NICE_NAME = "Rinkeby Test Network";

export interface AppState {
  creationModalOpen: boolean;
  profileWalletAddress?: EthAddress;
  account?: EthAddress;
  currentNetwork?: string;
}

class App extends React.Component<AppProps & DispatchProp<any>, AppState> {
  public civil: Civil | undefined;
  public accountStream: any;
  public networkStream: any;

  constructor(props: AppProps & DispatchProp<any>) {
    super(props);
    this.civil = getCivil();
    this.state = {
      creationModalOpen: false,
    };
  }

  public async componentDidMount(): Promise<void> {
    if (!this.props.address && this.props.txHash && this.civil) {
      const newsroom = await this.civil.newsroomFromFactoryTxHashUntrusted(this.props.txHash);
      this.onNewsroomCreated(newsroom.address);
    }

    if (this.civil) {
      this.accountStream = this.civil!.accountStream.subscribe(this.setUserAccount);
      this.networkStream = this.civil!.networkNameStream.subscribe(this.setNetwork);
    }

    const userInfo = await apiRequest({ path: "/wp/v2/users/me" });
    this.setState({
      profileWalletAddress: userInfo[userMetaKeys.WALLET_ADDRESS]
    })
  }

  public async componentWillMount(): Promise<void> {
    if (this.accountStream) {
      this.accountStream.unsubscribe();
    }
    if (this.networkStream) {
      this.networkStream.unsubscribe();
    }
  }

  public render(): JSX.Element {
    const manager = this.civil ? <Newsroom
      disabled={this.state.account !== this.state.profileWalletAddress}
      civil={this.civil}
      address={this.props.address}
      txHash={this.props.txHash}
      account={this.state.account}
      onNewsroomCreated={this.onNewsroomCreated}
      getNameForAddress={this.getNameForAddress}
      onContractDeployStarted={this.onContractDeployStarted}
      requiredNetwork="rinkeby"
      currentNetwork={this.state.currentNetwork}
      renderUserSearch={this.renderUserSearch}
      theme={{
        primaryButtonBackground: "#0085ba",
        primaryButtonColor: "#fff",
        primaryButtonHoverBackground: "#008ec2",
        primaryButtonDisabledBackground: "#008ec2",
        primaryButtonDisabledColor: "#66c6e4",
        primaryButtonTextTransform: "none",
        secondaryButtonColor: "#555555",
        secondaryButtonBackground: "transparent",
        secondaryButtonBorder: "#cccccc",
        borderlessButtonColor: "#0085ba",
        borderlessButtonHoverColor: "#008ec2",
      }}
    /> : null;
    return (
      <>
        <WalletStatus
          noProvider={!hasInjectedProvider()}
          walletLocked={this.civil && !this.state.account}
          wrongNetwork={this.civil && this.state.currentNetwork !== NETWORK_NAME}
          networkName={NETWORK_NICE_NAME}
          metamaskWalletAddress={this.state.account}
          profileWalletAddress={this.state.profileWalletAddress}
          saveAddressToProfile={this.saveAddressToProfile}
        />
        <hr />
        {manager}
        {this.renderCreationModal()}
      </>

    );
  }

  private setUserAccount = (address: EthAddress): void => {
    this.setState({account: address});
  }

  private setNetwork = (network: string): void => {
    this.setState({currentNetwork: network});
  }

  private renderUserSearch = (onSetAddress: any): JSX.Element => {
    return <SearchUsers onSetAddress={onSetAddress} getOptions={this.fetchUserTypeAhead}/>;
  }

  private fetchUserTypeAhead = async (str: string): Promise<any[]> => {
    return apiRequest({
      method: "GET",
      path: `/wp/v2/users?search=${str}&context=edit`,
    });
  }

  private renderCreationModal = (): JSX.Element | null => {
    if (!this.state.creationModalOpen) {
      return null;
    }
    return (<Modal>
      <h2>Congratulations!</h2>
      <p>You've created a newsroom.</p>
      <p>Now you can add additional officers and editors to help you manage your newsroom and publish content on the blockchain.</p>
      <Button size={buttonSizes.MEDIUM_WIDE} onClick={() => this.setState({creationModalOpen: false})}>Close</Button>
    </Modal>)
  }

  private onContractDeployStarted = async (txHash: TxHash) => {
    const settings = await apiRequest({
      path: "/wp/v2/settings",
      method: "PUT",
      data: {
        [siteOptionKeys.NEWSROOM_TXHASH]: txHash,
      },
    });
    this.props.dispatch!(addTxHash(txHash));
  };

  private onNewsroomCreated = async (address: EthAddress) => {
    const settings = await apiRequest({
      path: "/wp/v2/settings",
      method: "PUT",
      data: {
        [siteOptionKeys.NEWSROOM_ADDRESS]: address,
      },
    });
    this.setState({creationModalOpen: true});
    this.props.dispatch(addAddress(settings[siteOptionKeys.NEWSROOM_ADDRESS]));
  };

  private saveAddressToProfile = async () => {
    await apiRequest({
        method: "POST",
        path: apiNamespace + "users/me",
        data: {
            [userMetaKeys.WALLET_ADDRESS]: this.state.account,
        },
    });

    this.setState({
      profileWalletAddress: this.state.account
    });
  }

  private getNameForAddress = async (address: EthAddress) => {
    try {
      const user = await apiRequest({
        path: apiNamespace + `user-by-eth-address/${address}`,
      });
      return user.display_name;
    } catch (e) {
      return "Could not find a user with that address.";
    }
  };
}

const mapStateToProps = (state: ManagerState): AppProps => {
  const { user } = state;
  const address = user.get("address");
  const txHash = user.get("txHash");
  return {
    address,
    txHash,
  };
};

export default connect(mapStateToProps)(App);
