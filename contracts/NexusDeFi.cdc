import "FungibleToken"
import "FlowToken"

/**
 * @title NexusDeFi
 * @dev Cadence resource for consumer DeFi, subscriptions, and savings.
 */
pub contract NexusDeFi {

    pub resource Subscription {
        pub let provider: Address
        pub let amount: UFix64
        pub let interval: UFix64
        pub var lastPaid: UFix64

        init(provider: Address, amount: UFix64, interval: UFix64) {
            self.provider = provider
            self.amount = amount
            self.interval = interval
            self.lastPaid = getCurrentBlock().timestamp
        }

        pub fun execute(vault: &FlowToken.Vault) {
            pre {
                getCurrentBlock().timestamp >= self.lastPaid + self.interval: "Too early"
            }
            // Logic to transfer funds to provider
            self.lastPaid = getCurrentBlock().timestamp
        }
    }

    pub resource interface SavingsAccount {
        pub fun deposit(amount: UFix64)
        pub fun withdraw(amount: UFix64)
    }

    pub resource Account: SavingsAccount {
        access(self) var balance: UFix64

        init() {
            self.balance = 0.0
        }

        pub fun deposit(amount: UFix64) {
            self.balance = self.balance + amount
        }

        pub fun withdraw(amount: UFix64) {
            self.balance = self.balance - amount
        }
    }

    pub fun createAccount(): @Account {
        return <- create Account()
    }
}
