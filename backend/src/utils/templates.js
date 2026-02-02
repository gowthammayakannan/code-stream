const TEMPLATES = {
    javascript: `// Welcome to CodeStream!
// JavaScript Professional Template

async function main() {
  console.log("🚀 CodeStream JavaScript Engine Active");
  
  const data = [1, 2, 3, 4, 5];
  const squared = data.map(n => n * n);
  
  console.log("Squared Data:", squared);
  
  // Try an async operation
  await new Promise(r => setTimeout(r, 1000));
  console.log("✓ Ready for collaboration");
}

main();`,

    typescript: `// Welcome to CodeStream!
// TypeScript Professional Template

interface User {
  id: string;
  role: 'admin' | 'dev';
  status: 'active' | 'idle';
}

class Workspace {
  constructor(public name: string) {}
  
  getStatus(user: User): string {
    return \`\${user.id} is currently \${user.status} in \${this.name}\`;
  }
}

const admin: User = { id: 'Gowtham', role: 'admin', status: 'active' };
const ws = new Workspace('Main API');

console.log("🚀 TypeScript Engine Status:", ws.getStatus(admin));`,

    python: `# Welcome to CodeStream!
# Python 3 Professional Template
import asyncio

async def initialize_system():
    print("🚀 CodeStream Python Engine Starting...")
    await asyncio.sleep(1)
    
    system_nodes = ["Auth", "Database", "Sync"]
    status = {node: "OK" for node in system_nodes}
    
    print(f"System Status: {status}")
    print("✓ All systems operational")

if __name__ == "__main__":
    asyncio.run(initialize_system())`,

    rust: `// Welcome to CodeStream!
// Rust Professional Template

#[derive(Debug)]
struct Room {
    id: u32,
    name: String,
    active: bool,
}

impl Room {
    fn new(id: u32, name: &str) -> Self {
        Self {
            id,
            name: name.to_string(),
            active: true,
        }
    }
}

fn main() {
    println!("🚀 CodeStream Rust Engine Active");
    
    let my_room = Room::new(101, "Backend Engine");
    println!("Initialized: {:?}", my_room);
    
    let scores = vec![10, 20, 30];
    let sum: i32 = scores.iter().sum();
    println!("Sync Score: {}", sum);
}`,

    go: `// Welcome to CodeStream!
package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("🚀 CodeStream Go Engine Active")
	
	channel := make(chan string)
	
	go func() {
		time.Sleep(1 * time.Second)
		channel <- "✓ Concurrent sync ready"
	}()
	
	fmt.Println("Waiting for background task...")
	msg := <-channel
	fmt.Println(msg)
}`,

    java: `// Welcome to CodeStream!
import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("🚀 CodeStream Java Engine Active");
        
        List<String> modules = Arrays.asList("Kernel", "Sync", "Auth");
        
        System.out.println("Initializing modules...");
        modules.forEach(m -> System.out.println(" - " + m + ": LOADED"));
        
        System.out.println("✓ Ready for high-concurrency tasks");
    }
}`,

    cpp: `// Welcome to CodeStream!
#include <iostream>
#include <vector>
#include <string>

class System {
public:
    System(std::string name) : m_name(name) {}
    void status() {
        std::cout << "🚀 CodeStream C++ Engine [" << m_name << "] Active" << std::endl;
    }
private:
    std::string m_name;
};

int main() {
    System sys("Core Engine");
    sys.status();
    
    std::vector<int> data = {1, 2, 3, 4, 5};
    std::cout << "Data points synchronized: " << data.size() << std::endl;
    
    return 0;
}`,
};

module.exports = { TEMPLATES };
