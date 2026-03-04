use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{near_bindgen, AccountId, PanicOnDefault};
use std::collections::HashMap;

/**
 * @title NexusAI
 * @dev NEAR Rust contract for persistent AI agents and user memory management.
 */
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct NexusAI {
    pub agents: HashMap<AccountId, AgentProfile>,
}

#[derive(BorshDeserialize, BorshSerialize)]
pub struct AgentProfile {
    pub memory_hash: String,
    pub last_interaction: u64,
    pub active_workflows: Vec<String>,
}

#[near_bindgen]
impl NexusAI {
    #[init]
    pub fn new() -> Self {
        Self {
            agents: HashMap::new(),
        }
    }

    pub fn update_memory(&mut self, memory_hash: String) {
        let account_id = near_sdk::env::predecessor_account_id();
        let profile = self.agents.entry(account_id).or_insert(AgentProfile {
            memory_hash: memory_hash.clone(),
            last_interaction: near_sdk::env::block_timestamp(),
            active_workflows: Vec::new(),
        });
        profile.memory_hash = memory_hash;
        profile.last_interaction = near_sdk::env::block_timestamp();
    }

    pub fn get_memory(&self, account_id: AccountId) -> Option<String> {
        self.agents.get(&account_id).map(|p| p.memory_hash.clone())
    }
}
