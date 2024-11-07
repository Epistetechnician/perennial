const deployedContracts = {
  "11155111": [
    {
      "name": "sepolia",
      "chainId": "11155111",
      "contracts": {
        "perennialprediction": {
          "address": "0xffDB8b3c65C5bB7e1a638E257D7C01A7561afb46",
          "abi": [/* your ABI here */]
        }
      }
    }
  ]
} as const;

export default deployedContracts;
export const { perennialprediction } = deployedContracts["11155111"][0].contracts;