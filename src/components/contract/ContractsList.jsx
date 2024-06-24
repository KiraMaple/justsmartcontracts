import React from 'react';
import PropTypes from 'prop-types';
import { Button, List, Card, Modal } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import Blockies from 'react-blockies';
import { shortenEthAddress } from '../../scripts/utils.js';
import ContractForm from './ContractForm.jsx';
import classnames from 'classnames';
import * as storage from '../../scripts/storage';

import styles from './ContractsList.scss';
import DownloadButton from '../common/DownloadButton.jsx';
import { showError } from '../common/errorMessage.js';
import errorCodes from '../../scripts/errorCodes.js';

/**
 * List of stored contracts located in the side panel
 */
class ContractsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            contractToEdit: null,
            modalVisible: false,
            modalConfirmationVisible: false,
        };
        this.startAddContract = this.startAddContract.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.handleAddButton = this.handleAddButton.bind(this);
        this.handleDeleteButton = this.handleDeleteButton.bind(this);
        this.renderCardControls = this.renderCardControls.bind(this);
        this.showConfirmationModal = this.showConfirmationModal.bind(this);
        this.closeConfirmationModal = this.closeConfirmationModal.bind(this);
        this.onConfirmedDelete = this.onConfirmedDelete.bind(this);
        this.startEdit = this.startEdit.bind(this);
        this.recoverInputRef = React.createRef();
    }

    startAddContract() {
        this.setState({
            contractToEdit: null,
            modalVisible: true,
        });
    }

    getBackupFileContent() {
        return JSON.stringify({
            [storage.nodesField]: storage.getCustomNodes(),
            [storage.contractsField]: storage.getContracts(),
        });
    }

    getBackupFileName() {
        return `justsmartcontract-config-${Math.trunc(Date.now() / 1000)}.json`;
    }

    recoverConfig(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target.result;
          try {
              const data = JSON.parse(content);
              storage.saveNetworks(data[storage.nodesField]);
              storage.saveContracts(data[storage.contractsField]);
              location.reload();
          } catch (e) {
            showError(errorCodes.recoverConfig);
          }
        }
        reader.readAsText(file);
    }

    closeModal() {
        this.setState({
            modalVisible: false,
        });
    }

    showConfirmationModal() {
        this.setState({
            modalConfirmationVisible: true,
        });
    }

    closeConfirmationModal() {
        this.setState({
            modalConfirmationVisible: false,
        });
    }

    handleAddButton(name, address, networkId, abi) {
        this.closeModal();
        if (this.state.contractToEdit) {
            this.props.onEditContract(this.state.contractToEdit, name, address, networkId, abi);
        } else {
            this.props.onAddContract(name, address, networkId, abi);
        }
    }

    handleDeleteButton(e, networkId, name) {
        this.setState({
            deletingContract: { id: networkId, name: name },
        });
        this.showConfirmationModal();
        e.stopPropagation();
    }

    onConfirmedDelete() {
        this.props.onDeleteContract(this.state.deletingContract.id, this.state.deletingContract.name);
        this.closeConfirmationModal();
    }

    startEdit(contract) {
        this.setState({
            contractToEdit: contract,
            modalVisible: true,
        });
    }

    renderCardControls(contract) {
        return (
            <>
                <Blockies seed={contract.address.toLowerCase()} />
                <div>
                    <Button type="default" name="editButton" size="small" onClick={(e) => this.startEdit(contract)}>
                        <EditOutlined />
                    </Button>
                    <Button
                        type="default"
                        name="deleteButton"
                        size="small"
                        onClick={(e) => this.handleDeleteButton(e, contract.networkId, contract.name)}
                    >
                        <DeleteOutlined />
                    </Button>
                </div>
            </>
        );
    }

    render() {
        const isSelected = (contract) =>
            this.props.activeContract && this.props.activeContract.address == contract.address;

        return (
            <>
                <div>
                    <Modal
                        visible={this.state.modalVisible}
                        onCancel={this.closeModal}
                        onOk={this.props.onAddContract}
                        footer={null}
                        maskClosable={false}
                    >
                        <ContractForm onAddContract={this.handleAddButton} contract={this.state.contractToEdit} />
                    </Modal>
                </div>
                <List>
                    {this.props.contracts.map((contract) => (
                        <Card
                            size="small"
                            onClick={() => this.props.onChangeContract(contract.name)}
                            className={classnames({
                                [styles.selectedContract]: isSelected(contract),
                                [styles.contractCard]: true,
                            })}
                            key={contract.address}
                            extra={this.renderCardControls(contract)}
                        >
                            <Card.Meta
                                className={styles.cardMeta}
                                title={contract.name}
                                description={shortenEthAddress(contract.address, 4)}
                            />
                        </Card>
                    ))}
                </List>
                <div>
                    <Button type="primary" className={styles.addButton} onClick={this.startAddContract}>
                        Add contract
                    </Button>
                </div>
                <div>
                    <DownloadButton
                        type="primary" className={styles.addButton} 
                        getContent={this.getBackupFileContent}
                        getFileName={this.getBackupFileName}
                    >
                        Backup config
                    </DownloadButton>
                </div>
                <div>
                    <input ref={this.recoverInputRef} type="file" onChange={this.recoverConfig} style={{ display: 'none' }} />
                    <Button type="primary" className={styles.addButton} onClick={() => this.recoverInputRef.current.click()}>
                        Recover config
                    </Button>
                </div>
                <Modal
                    visible={this.state.modalConfirmationVisible}
                    onOk={this.onConfirmedDelete}
                    onCancel={this.closeConfirmationModal}
                    maskClosable={false}
                >
                    <p>{`Really delete '${this.state.deletingContract ? this.state.deletingContract.name : ''}'?`}</p>
                </Modal>
            </>
        );
    }
}

ContractsList.propTypes = {
    contracts: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ContractsList;
