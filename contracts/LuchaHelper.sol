// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "./interfaces/IRouter.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract LuchaHelper is Ownable {
    address public constant ETHER = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    IRouter public router;
    address public luchaTreasury;
    uint256 public fee; // Percentage where 1000 = 100% so 1 = 0.1%

    constructor(
        address _router,
        address _luchaTreasury,
        uint256 _fee
    ) Ownable(msg.sender) {
        router = IRouter(_router);
        luchaTreasury = _luchaTreasury;
        fee = _fee;
    }

    function setLuchaTreasury(address _luchaTreasury) external onlyOwner {
        luchaTreasury = _luchaTreasury;
    }

    function setFee(uint256 _fee) external onlyOwner {
        fee = _fee;
    }

    function zapIn(
        address tokenIn,
        uint256 amountInA,
        uint256 amountInB,
        IRouter.Zap calldata zapInPool,
        IRouter.Route[] calldata routesA,
        IRouter.Route[] calldata routesB,
        address to,
        bool stake
    ) external payable returns (uint256 liquidity) {
        uint256 totalAmount = amountInA + amountInB;
        uint256 feeAmount = (totalAmount * fee) / 1000;
        uint256 amountAfterFee = applyFee(totalAmount);
        uint256 amountInAfterFeeA = applyFee(amountInA);
        uint256 amountInAfterFeeB = applyFee(amountInB);
        uint256 msgValueAfterFee = applyFee(msg.value);
        if (tokenIn != ETHER) {
            IERC20(tokenIn).transferFrom(
                msg.sender,
                address(this),
                totalAmount
            );
            IERC20(tokenIn).transfer(luchaTreasury, feeAmount);
            IERC20(tokenIn).approve(address(router), amountAfterFee);
        } else {
            payable(luchaTreasury).transfer(feeAmount);
        }

        return
            router.zapIn{value: msgValueAfterFee}(
                tokenIn,
                amountInAfterFeeA,
                amountInAfterFeeB,
                zapInPool,
                routesA,
                routesB,
                to,
                stake
            );
    }

    function applyFee(uint256 amount) internal view returns (uint256) {
        return amount - ((amount * fee) / 1000);
    }

    receive() external payable {}
}
