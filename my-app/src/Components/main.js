import React from "react";
import { Row, Col, Button } from "reactstrap";

export default props => {
  return (
    <div>
      <Row noGutters className="text-center align-items-center room-cta">
        <Col>
          <p className="looking-for-rooms">
            If you are looking for great rooms
            // <i className="fas fa-pizza-slice pizza-slice"></i>
          </p>
          <Button
            color="none"
            className="book-table-btn"
            onClick={_ => {
              props.setPage(1);
            }}
          >
            Book a Room
          </Button>
        </Col>
      </Row>
      // <Row noGutters className="text-center big-img-container">
      //   <Col>
      //     Something random
 
      //   </Col>
      // </Row>
    </div>
  );
};