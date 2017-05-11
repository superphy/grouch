// This implements a single Group selection
// Multiple restrictions on the search query should be contained in separate GroupField objects
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types'
import AddAttribute from './AddAttribute';
import Button from 'react-md/lib/Buttons/Button';
import Subheader from 'react-md/lib/Subheaders';

class Group extends PureComponent {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }
  componentDidMount() {
    console.log(this.state)
  }
  onClick(){
    // callback
    this.props.handleChangeAddRelation(this.props.groupIndex)
  }
  render() {
    return (
      <div>
        <Subheader primary primaryText={"Group: " + this.props.groupIndex} />
        <Button flat label="Add another relation to this group" secondary onClick={this.onClick}>add</Button>
      {this.props.group.map((selection, index) =>
        <div className="md-grid" key={index}>
          <AddAttribute groupIndex={this.props.groupIndex} key={selection.key} relations={this.props.relations} attributes={this.props.attributes} handleChange={this.props.handleChange} attributeIndex={index}/>
        </div>
      )}
    </div>
    );
  }
}

Group.propTypes = {
  handleChange: PropTypes.func
}

export default Group;
