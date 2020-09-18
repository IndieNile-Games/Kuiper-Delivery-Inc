#include <iostream>
#include <SFML/Graphics.hpp>

void log(std::string text)
{
    std::cout << "[LOGGER] " + text << std::endl;
};

int main() 
{
    log("Starting App...");
    sf::Image icon;
    icon.loadFromFile("images/icon.png");
    log("Loading SFML Icon...");
    sf::RenderWindow window(sf::VideoMode(600, 600), "LettuceMan Studios' Entry for VimJam 2020");
    log("Initiating Window...");
    window.setIcon(icon.getSize().x, icon.getSize().y, icon.getPixelsPtr());

    sf::CircleShape shape(300.f);
    shape.setFillColor(sf::Color::Red);
    log("Creating Cirlce...");

    while (window.isOpen())
    {
        sf::Event event;
        while (window.pollEvent(event))
        {
            if (event.type == sf::Event::Closed) {
                log("Closing Window...");
                window.close();
            };
        };

        window.clear();
        window.draw(shape);
        window.display();
    };

    log("Done!");
    return 0;
};