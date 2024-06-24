import React from 'react';
import PropTypes from 'prop-types';
import { Select, Input } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import styles from './NetworkIdSelect.scss';
import * as storage from '../../scripts/storage';

const { Option } = Select;
/**
 * Input for Ethereum network id, a list of preordered ids and field for manual input
 * Props:
 *  value - value to display: 1/3/ etc.
 *  onChange - function (value) => (). Id change event handler
 */
class NetworkIdSelect extends React.Component {
    constructor(props) {
        super(props);

        let customNodes = storage.getCustomNodes();
        this.idPresets = [
            { id: '1', label: 'Mainnet' },
            { id: '3', label: 'Ropsten' },
            { id: '4', label: 'Rinkeby' },
            { id: '5', label: 'Goerli' },
            { id: '42', label: 'Kovan' },
        ].concat(customNodes.nodes.map(v => ({ id: v.id, label: v.name })));

        this.state = {
            inputEnabled: this.isCustomId(this.props.value),
        };
        this.handleIdSelect = this.handleIdSelect.bind(this);
        this.handleIdInput = this.handleIdInput.bind(this);
        this.isCustomId = this.isCustomId.bind(this);
    }

    handleIdSelect(id) {
        this.setState({
            inputEnabled: this.isCustomId(id),
        });
        this.props.onChange(id);
    }

    handleIdInput(e) {
        const reg = /^\d+$/;
        if (reg.test(e.target.value)) {
            this.props.onChange(e.target.value);
        }
    }

    isCustomId(id) {
        return this.idPresets.map((item) => item.id).indexOf(id) == -1;
    }

    render() {
        const selectedValue = this.isCustomId(this.props.value)
            ? '0'
            : this.props.value;

        const selectAfter = (
            <Select
                defaultValue={selectedValue}
                onSelect={this.handleIdSelect}
                className={styles.idList}
            >
                {this.idPresets.map((item) => (
                    <Option key={item.id} value={item.id}>
                        {item.label}
                    </Option>
                ))}
                <Option value="0">
                    <EditOutlined />
                    Custom
                </Option>
            </Select>
        );

        return (
            <Input
                onChange={this.handleIdInput}
                addonAfter={selectAfter}
                value={this.props.value}
                disabled={!this.state.inputEnabled}
            ></Input>
        );
    }
}


NetworkIdSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
};


export default NetworkIdSelect;

