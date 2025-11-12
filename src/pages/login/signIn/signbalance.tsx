import { useState } from "react";
import { Container, Row, Col, Input, Label } from "reactstrap";
import ButtonW_100 from "../../../components/generic_components/btn";
import { motion } from "framer-motion";

export default function BalanceInput({ onNext }: any) {

  const [balance, setBalance] = useState("");

  function handleSubmit() {
    if (balance.trim() === "" || isNaN(Number(balance))) {
      alert("Digite um valor válido para o saldo!");
      return;
    }
    onNext(Number(balance));
  }

  return (
    <div className="background-color text-white vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} className="p-4 rounded">

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="p-4 rounded"
            >
              <motion.h4
                className="mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Qual é seu saldo atual?
              </motion.h4>

              <Label className="fw-bold">Quanto dinheiro você possui na conta?</Label>

              <motion.div
                className="w-100 d-flex gap-4 align-items-center justify-content-center mb-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="h1 mb-0">R$</span>

                <Input
                  type="number"
                  step="0.01"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="Digite seu saldo atual"
                  className="custom-input-balance"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <ButtonW_100
                  label="Finalizar"
                  onClick={handleSubmit}
                />
              </motion.div>

            </motion.div>

          </Col>
        </Row>
      </Container>
    </div>
  );
}
